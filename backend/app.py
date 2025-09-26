from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import uuid
from datetime import datetime
import difflib
import re

app = FastAPI(title="FHIR Terminology Microservice", version="1.0.0")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
namaste_data = []
icd11_data = []
concept_map = []
patients_data = []
audit_logs = []

# Load data on startup
def load_data():
    global namaste_data, icd11_data, concept_map, patients_data
    try:
        with open('../data/namaste.json', 'r') as f:
            namaste_data = json.load(f)
        with open('../data/icd11.json', 'r') as f:
            icd11_data = json.load(f)
        with open('../data/conceptmap.json', 'r') as f:
            concept_map = json.load(f)
        with open('../data/patients.json', 'r') as f:
            patients_data = json.load(f)
    except FileNotFoundError as e:
        print(f"Warning: Could not load data file: {e}")

# Pydantic models
class AutocompleteResponse(BaseModel):
    system: str
    code: str
    display: str
    synonyms: List[str]
    mappings: List[Dict[str, Any]]

class TranslateRequest(BaseModel):
    fromSystem: str
    code: str
    toSystem: str

class TranslateResponse(BaseModel):
    mappings: List[Dict[str, Any]]
    suggestions: List[Dict[str, Any]]

class ChatRequest(BaseModel):
    patientRef: Optional[str] = None
    query: str

class ChatResponse(BaseModel):
    suggestions: List[Dict[str, Any]]
    fhirCondition: Dict[str, Any]

class FHIRBundle(BaseModel):
    resourceType: str = "Bundle"
    id: Optional[str] = None
    entry: List[Dict[str, Any]]

# Authentication dependency
def verify_abha_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="ABHA token required (mock)")
    return authorization.replace("Bearer ", "")

def verify_consent(x_consent_artifact: Optional[str] = Header(None)):
    return x_consent_artifact

# Utility functions
def fuzzy_search(query: str, data: List[Dict], fields: List[str], limit: int = 10) -> List[Dict]:
    """Perform fuzzy search across specified fields"""
    query_lower = query.lower()
    results = []
    
    for item in data:
        score = 0
        for field in fields:
            if field in item:
                if isinstance(item[field], list):
                    # Handle synonyms array
                    for synonym in item[field]:
                        if query_lower in synonym.lower():
                            score += 0.8
                        elif difflib.SequenceMatcher(None, query_lower, synonym.lower()).ratio() > 0.6:
                            score += 0.5
                elif isinstance(item[field], str):
                    if query_lower in item[field].lower():
                        score += 1.0
                    elif difflib.SequenceMatcher(None, query_lower, item[field].lower()).ratio() > 0.6:
                        score += 0.6
        
        if score > 0:
            results.append((item, score))
    
    # Sort by score and return top results
    results.sort(key=lambda x: x[1], reverse=True)
    return [item[0] for item in results[:limit]]

def get_mappings_for_code(code: str, from_system: str) -> List[Dict]:
    """Get all mappings for a given code"""
    mappings = []
    for mapping in concept_map:
        if mapping['fromCode'] == code and mapping['fromSystem'] == from_system:
            # Find the target code details
            target_code = None
            if mapping['toSystem'] == 'ICD11-TM2':
                target_code = next((item for item in icd11_data if item['code'] == mapping['toCode'] and item['chapter'] == 'TM2'), None)
            elif mapping['toSystem'] == 'ICD11-Biomed':
                target_code = next((item for item in icd11_data if item['code'] == mapping['toCode'] and item['chapter'] == 'Biomed'), None)
            
            if target_code:
                mappings.append({
                    'system': mapping['toSystem'],
                    'code': mapping['toCode'],
                    'display': target_code['title'],
                    'confidence': mapping['confidence'],
                    'equivalence': mapping['equivalence'],
                    'source': mapping['source']
                })
    
    return mappings

def add_audit_log(action: str, details: Dict, consent_missing: bool = False):
    """Add entry to audit log"""
    audit_entry = {
        'id': str(uuid.uuid4()),
        'timestamp': datetime.now().isoformat(),
        'action': action,
        'details': details,
        'consent_missing': consent_missing
    }
    audit_logs.append(audit_entry)
    # Keep only last 50 entries
    if len(audit_logs) > 50:
        audit_logs.pop(0)

# API Endpoints
@app.on_event("startup")
async def startup_event():
    load_data()

@app.get("/")
async def root():
    return {"message": "FHIR Terminology Microservice", "version": "1.0.0"}

@app.get("/v1/terminology/autocomplete")
async def autocomplete(q: str, limit: int = 10):
    """Fuzzy text search over NAMASTE terms with mapped ICD codes"""
    results = fuzzy_search(q, namaste_data, ['display', 'synonyms', 'definition'], limit)
    
    response = []
    for item in results:
        mappings = get_mappings_for_code(item['code'], 'NAMASTE')
        response.append(AutocompleteResponse(
            system='NAMASTE',
            code=item['code'],
            display=item['display'],
            synonyms=item['synonyms'],
            mappings=mappings
        ))
    
    return response

@app.post("/v1/terminology/translate")
async def translate(request: TranslateRequest):
    """Translate codes between systems"""
    mappings = []
    suggestions = []
    
    # Find direct mappings
    for mapping in concept_map:
        if (mapping['fromCode'] == request.code and 
            mapping['fromSystem'] == request.fromSystem and 
            mapping['toSystem'] == request.toSystem):
            
            target_code = None
            if request.toSystem == 'ICD11-TM2':
                target_code = next((item for item in icd11_data if item['code'] == mapping['toCode'] and item['chapter'] == 'TM2'), None)
            elif request.toSystem == 'ICD11-Biomed':
                target_code = next((item for item in icd11_data if item['code'] == mapping['toCode'] and item['chapter'] == 'Biomed'), None)
            
            if target_code:
                mappings.append({
                    'system': request.toSystem,
                    'code': mapping['toCode'],
                    'display': target_code['title'],
                    'confidence': mapping['confidence'],
                    'equivalence': mapping['equivalence'],
                    'source': mapping['source']
                })
    
    # If no direct mapping, provide suggestions
    if not mappings:
        source_term = next((item for item in namaste_data if item['code'] == request.code), None)
        if source_term:
            # Fuzzy match on ICD-11 terms
            target_chapter = 'TM2' if request.toSystem == 'ICD11-TM2' else 'Biomed'
            icd_subset = [item for item in icd11_data if item['chapter'] == target_chapter]
            
            fuzzy_matches = fuzzy_search(source_term['display'], icd_subset, ['title', 'synonyms'], 3)
            for match in fuzzy_matches:
                suggestions.append({
                    'system': request.toSystem,
                    'code': match['code'],
                    'display': match['title'],
                    'confidence': 0.5,  # Lower confidence for suggestions
                    'equivalence': 'related',
                    'source': 'fuzzy-suggested'
                })
    
    return TranslateResponse(mappings=mappings, suggestions=suggestions)

@app.get("/fhir/CodeSystem/namaste")
async def get_namaste_codesystem():
    """Return FHIR CodeSystem for NAMASTE"""
    concepts = []
    for item in namaste_data:
        concept = {
            'code': item['code'],
            'display': item['display'],
            'definition': item['definition'],
            'property': [
                {
                    'code': 'system',
                    'valueString': item['system']
                }
            ]
        }
        concepts.append(concept)
    
    codesystem = {
        'resourceType': 'CodeSystem',
        'id': 'namaste',
        'url': 'http://terminology.hl7.org/CodeSystem/namaste',
        'version': '1.0.0',
        'name': 'NAMASTE',
        'title': 'NAMASTE Traditional Medicine Terminology',
        'status': 'active',
        'date': '2024-01-01',
        'publisher': 'FHIR Terminology Microservice',
        'description': 'Traditional medicine terminology covering Ayurveda, Siddha, and Unani systems',
        'content': 'complete',
        'count': len(concepts),
        'concept': concepts
    }
    
    return codesystem

@app.get("/fhir/ConceptMap/namaste-to-icd11")
async def get_concept_map():
    """Return FHIR ConceptMap for NAMASTE to ICD-11"""
    groups = {}
    
    for mapping in concept_map:
        group_key = f"{mapping['fromSystem']}-{mapping['toSystem']}"
        if group_key not in groups:
            groups[group_key] = {
                'source': mapping['fromSystem'],
                'target': mapping['toSystem'],
                'element': []
            }
        
        element = {
            'code': mapping['fromCode'],
            'target': [{
                'code': mapping['toCode'],
                'equivalence': mapping['equivalence'],
                'extension': [
                    {
                        'url': 'http://hl7.org/fhir/StructureDefinition/concept-map-confidence',
                        'valueDecimal': mapping['confidence']
                    },
                    {
                        'url': 'http://hl7.org/fhir/StructureDefinition/concept-map-source',
                        'valueString': mapping['source']
                    }
                ]
            }]
        }
        groups[group_key]['element'].append(element)
    
    conceptmap = {
        'resourceType': 'ConceptMap',
        'id': 'namaste-to-icd11',
        'url': 'http://terminology.hl7.org/ConceptMap/namaste-to-icd11',
        'version': 'demo-1.0',
        'name': 'NAMASTEToICD11',
        'title': 'NAMASTE to ICD-11 Concept Map',
        'status': 'active',
        'date': '2024-01-01',
        'publisher': 'FHIR Terminology Microservice',
        'description': 'Mapping from NAMASTE traditional medicine codes to ICD-11',
        'sourceUri': 'http://terminology.hl7.org/CodeSystem/namaste',
        'targetUri': 'http://terminology.hl7.org/CodeSystem/icd11',
        'group': list(groups.values())
    }
    
    return conceptmap

@app.post("/v1/fhir/Bundle")
async def process_bundle(
    bundle: FHIRBundle,
    token: str = Depends(verify_abha_token),
    consent: Optional[str] = Depends(verify_consent)
):
    """Process FHIR Bundle and add dual-coding"""
    audit_id = str(uuid.uuid4())
    consent_missing = consent is None
    
    # Process each entry in the bundle
    for entry in bundle.entry:
        if entry.get('resource', {}).get('resourceType') == 'Condition':
            condition = entry['resource']
            
            # Check if condition has NAMASTE coding
            if 'code' in condition and 'coding' in condition['code']:
                new_codings = []
                
                for coding in condition['code']['coding']:
                    new_codings.append(coding)  # Keep original
                    
                    # If NAMASTE code, add mapped ICD-11 codes
                    if coding.get('system') == 'NAMASTE':
                        mappings = get_mappings_for_code(coding['code'], 'NAMASTE')
                        
                        for mapping in mappings:
                            if mapping['source'] == 'approved':
                                # Add approved mapping
                                new_codings.append({
                                    'system': mapping['system'],
                                    'code': mapping['code'],
                                    'display': mapping['display']
                                })
                            else:
                                # Add as extension for suggested mappings
                                if 'extension' not in condition:
                                    condition['extension'] = []
                                condition['extension'].append({
                                    'url': 'http://hl7.org/fhir/StructureDefinition/suggested-coding',
                                    'valueCoding': {
                                        'system': mapping['system'],
                                        'code': mapping['code'],
                                        'display': mapping['display']
                                    },
                                    'extension': [{
                                        'url': 'suggested',
                                        'valueBoolean': True
                                    }]
                                })
                
                condition['code']['coding'] = new_codings
            
            # Add meta information
            condition['meta'] = {
                'versionId': '1',
                'lastUpdated': datetime.now().isoformat(),
                'source': 'FHIR-Terminology-Microservice'
            }
    
    # Add audit log
    add_audit_log(
        'bundle_processed',
        {
            'bundle_id': bundle.id,
            'entry_count': len(bundle.entry),
            'audit_id': audit_id
        },
        consent_missing
    )
    
    return {
        'bundle': bundle,
        'auditId': audit_id,
        'consentMissing': consent_missing
    }

@app.post("/v1/chat")
async def chat(
    request: ChatRequest,
    token: str = Depends(verify_abha_token),
    consent: Optional[str] = Depends(verify_consent)
):
    """Simple chatbot for code suggestions"""
    consent_missing = consent is None
    
    # Perform autocomplete search on query
    results = fuzzy_search(request.query, namaste_data, ['display', 'synonyms', 'definition'], 3)
    
    suggestions = []
    fhir_condition = None
    
    if results:
        best_match = results[0]
        mappings = get_mappings_for_code(best_match['code'], 'NAMASTE')
        
        suggestions.append({
            'namaste': {
                'code': best_match['code'],
                'display': best_match['display'],
                'system': 'NAMASTE'
            },
            'mappings': mappings,
            'confidence': 'high' if len(results) == 1 else 'medium'
        })
        
        # Create FHIR Condition snippet
        codings = [{
            'system': 'NAMASTE',
            'code': best_match['code'],
            'display': best_match['display']
        }]
        
        # Add approved mappings
        for mapping in mappings:
            if mapping['source'] == 'approved':
                codings.append({
                    'system': mapping['system'],
                    'code': mapping['code'],
                    'display': mapping['display']
                })
        
        fhir_condition = {
            'resourceType': 'Condition',
            'id': str(uuid.uuid4()),
            'code': {
                'coding': codings,
                'text': request.query
            },
            'subject': {
                'reference': f"Patient/{request.patientRef}" if request.patientRef else "Patient/demo"
            },
            'recordedDate': datetime.now().isoformat()
        }
    
    # Add audit log
    add_audit_log(
        'chat_query',
        {
            'query': request.query,
            'patient_ref': request.patientRef,
            'suggestions_count': len(suggestions)
        },
        consent_missing
    )
    
    return ChatResponse(suggestions=suggestions, fhirCondition=fhir_condition or {})

@app.get("/v1/audit/logs")
async def get_audit_logs():
    """Get recent audit logs"""
    return audit_logs[-10:]  # Return last 10 entries

@app.get("/v1/conceptmap/suggested")
async def get_suggested_mappings():
    """Get mappings that need curator approval"""
    suggested = [mapping for mapping in concept_map if mapping['source'] == 'suggested']
    return suggested

@app.post("/v1/conceptmap/approve/{from_code}/{to_code}")
async def approve_mapping(from_code: str, to_code: str):
    """Approve a suggested mapping"""
    for mapping in concept_map:
        if mapping['fromCode'] == from_code and mapping['toCode'] == to_code:
            mapping['source'] = 'approved'
            
            # Add audit log
            add_audit_log(
                'mapping_approved',
                {
                    'from_code': from_code,
                    'to_code': to_code,
                    'confidence': mapping['confidence']
                }
            )
            
            return {'status': 'approved', 'mapping': mapping}
    
    raise HTTPException(status_code=404, detail="Mapping not found")

@app.post("/v1/conceptmap/reject/{from_code}/{to_code}")
async def reject_mapping(from_code: str, to_code: str):
    """Reject a suggested mapping"""
    global concept_map
    original_count = len(concept_map)
    concept_map = [m for m in concept_map if not (m['fromCode'] == from_code and m['toCode'] == to_code)]
    
    if len(concept_map) < original_count:
        add_audit_log(
            'mapping_rejected',
            {
                'from_code': from_code,
                'to_code': to_code
            }
        )
        return {'status': 'rejected'}
    
    raise HTTPException(status_code=404, detail="Mapping not found")

@app.get("/v1/analytics/coverage")
async def get_mapping_coverage():
    """Get analytics on mapping coverage"""
    total_namaste = len(namaste_data)
    mapped_codes = set()
    approved_mappings = 0
    
    for mapping in concept_map:
        mapped_codes.add(mapping['fromCode'])
        if mapping['source'] == 'approved':
            approved_mappings += 1
    
    coverage_percentage = (len(mapped_codes) / total_namaste) * 100 if total_namaste > 0 else 0
    approval_percentage = (approved_mappings / len(concept_map)) * 100 if concept_map else 0
    
    return {
        'total_namaste_codes': total_namaste,
        'mapped_codes': len(mapped_codes),
        'coverage_percentage': round(coverage_percentage, 1),
        'total_mappings': len(concept_map),
        'approved_mappings': approved_mappings,
        'approval_percentage': round(approval_percentage, 1)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
