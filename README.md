# FHIR Terminology Microservice MVP

A hackathon-ready demonstration of a FHIR R4-compatible terminology microservice that maps NAMASTE (traditional medicine) codes to ICD-11 codes with dual-coding capabilities in an EMR-like interface.

## 🎯 Project Overview

This MVP demonstrates:
- **NAMASTE to ICD-11 Mapping**: Bidirectional terminology translation between traditional medicine and modern medical coding systems
- **FHIR R4 Compliance**: Full FHIR CodeSystem, ConceptMap, and Bundle support
- **Dual-Coding EMR Interface**: Modern web UI showing both traditional and ICD-11 codes
- **Curator Workflow**: Review and approval system for suggested mappings
- **AI Chat Assistant**: Natural language query interface for code suggestions
- **Audit Trail**: Complete logging with mock ABHA authentication

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional)

### Option 1: Local Development

1. **Clone and Setup**
   \`\`\`bash
   git clone <repository>
   cd fhir-terminology-mvp
   \`\`\`

2. **Start Backend**
   \`\`\`bash
   cd backend
   pip install -r requirements.txt
   python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
   \`\`\`

3. **Start Frontend** (in new terminal)
   \`\`\`bash
   cd frontend
   npm install
   npm run dev
   \`\`\`

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Option 2: Docker Compose

\`\`\`bash
docker-compose up --build
\`\`\`

Access at http://localhost:3000

## 📋 Demo Script (3-4 Minutes)

### Step 1: Search & Mapping Demo (60 seconds)
1. Open http://localhost:3000
2. In Search tab, type "Jvara"
3. Show NAMASTE match with ICD-11 mappings (TM2 + Biomed)
4. Click "Add to Problem List"
5. Note confidence badges and dual-coding

### Step 2: Problem List & FHIR Bundle (60 seconds)
1. Switch to "Problem List" tab
2. Click "Save as FHIR Bundle"
3. Show generated Bundle JSON with dual-coding
4. Note audit ID in sidebar
5. Download Bundle JSON

### Step 3: Curator Review (60 seconds)
1. Switch to "Curator View" tab
2. Show suggested mappings awaiting approval
3. Approve one mapping (e.g., Gulma → Abdominal mass)
4. Show updated ConceptMap version

### Step 4: Chat Assistant (45 seconds)
1. Switch to "Chat Assistant" tab
2. Type "fever and chills"
3. Show AI suggestions with FHIR Condition preview
4. Click "Add to Problem List"
5. Show audit trail update

### Step 5: Analytics Overview (15 seconds)
1. Switch to "Analytics" tab
2. Show mapping coverage percentage
3. Highlight approval metrics

## 🏗️ Architecture

\`\`\`
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │   JSON Data     │
│                 │    │                  │    │                 │
│ • Search UI     │◄──►│ • FHIR APIs     │◄──►│ • namaste.json  │
│ • Problem List  │    │ • Terminology    │    │ • icd11.json    │
│ • Curator View  │    │ • Chat Bot       │    │ • conceptmap.json│
│ • Chat Widget   │    │ • Audit Logging  │    │ • patients.json │
│ • Analytics     │    │ • Mock Auth      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
\`\`\`

## 🔌 API Endpoints

### Terminology Services
- `GET /v1/terminology/autocomplete?q={text}` - Fuzzy search NAMASTE terms
- `POST /v1/terminology/translate` - Translate between code systems
- `GET /v1/analytics/coverage` - Mapping coverage statistics

### FHIR Endpoints
- `GET /fhir/CodeSystem/namaste` - NAMASTE CodeSystem resource
- `GET /fhir/ConceptMap/namaste-to-icd11` - ConceptMap resource
- `POST /v1/fhir/Bundle` - Process Bundle with dual-coding

### Curator & Chat
- `GET /v1/conceptmap/suggested` - Pending mappings for review
- `POST /v1/conceptmap/approve/{from}/{to}` - Approve mapping
- `POST /v1/chat` - AI chat for code suggestions

### Audit & Analytics
- `GET /v1/audit/logs` - Recent audit entries
- `GET /v1/analytics/coverage` - Coverage metrics

## 📊 Sample Data

### NAMASTE Codes (20 terms)
- **Ayurveda**: Jvara (fever), Kasa (cough), Shwasa (dyspnea), Arsha (hemorrhoids), etc.
- **Siddha**: Humma (fever), Irumal (cough), Moolam (hemorrhoids)
- **Unani**: Hummiya (fever), Sual (cough), Bavaseer (hemorrhoids), etc.

### ICD-11 Mappings
- **TM2 Chapter**: Traditional medicine patterns (TM2-001 to TM2-102)
- **Biomed Chapter**: Standard biomedical codes (1A00, 5A11, CA23, etc.)

### Mapping Quality
- **Approved**: 16 high-confidence mappings (>80% confidence)
- **Suggested**: 8 pending curator review (60-75% confidence)
- **Coverage**: 75% of NAMASTE terms have ICD-11 mappings

## 🔐 Authentication & Audit

### Mock ABHA Integration
- Header: `Authorization: Bearer mock-abha-token`
- Consent: `X-Consent-Artifact: mock-consent-123`
- Returns 401 if missing (demo mode continues)

### Audit Trail
- All Bundle processing logged with audit ID
- Chat queries tracked with patient reference
- Curator actions (approve/reject) recorded
- Consent missing flag for compliance

## 🎨 UI Features

### Search & Autocomplete
- Real-time fuzzy search across NAMASTE terms
- Confidence badges (High/Medium/Low)
- System badges (NAMASTE, ICD11-TM2, ICD11-Biomed)
- Synonym matching and definition search

### Problem List Composer
- Drag-and-drop interface (future enhancement)
- Dual-coding visualization
- FHIR Bundle generation and download
- Real-time audit ID tracking

### Curator Review Panel
- Pending mappings queue
- Confidence and equivalence indicators
- One-click approve/reject workflow
- Version tracking for ConceptMap updates

### Chat Assistant
- Natural language processing for symptoms
- FHIR Condition snippet generation
- Confidence scoring for suggestions
- Direct integration with Problem List

### Analytics Dashboard
- Coverage percentage with progress bars
- Approval rate metrics
- Mapping quality breakdown
- Actionable recommendations

## 🧪 Testing the Demo

### Sample Queries
\`\`\`bash
# Search for fever terms
curl "http://localhost:8000/v1/terminology/autocomplete?q=fever&limit=5"

# Translate NAMASTE to ICD-11
curl -X POST "http://localhost:8000/v1/terminology/translate" \
  -H "Content-Type: application/json" \
  -d '{"fromSystem": "NAMASTE", "code": "NAM-001", "toSystem": "ICD11-TM2"}'

# Get FHIR CodeSystem
curl "http://localhost:8000/fhir/CodeSystem/namaste"

# Process FHIR Bundle (requires auth headers)
curl -X POST "http://localhost:8000/v1/fhir/Bundle" \
  -H "Authorization: Bearer mock-abha-token" \
  -H "X-Consent-Artifact: mock-consent-123" \
  -H "Content-Type: application/json" \
  -d @samples/bundle-example.json

# Chat query
curl -X POST "http://localhost:8000/v1/chat" \
  -H "Authorization: Bearer mock-abha-token" \
  -H "Content-Type: application/json" \
  -d '{"query": "patient has fever and headache", "patientRef": "demo-001"}'
\`\`\`

## 📁 Project Structure

\`\`\`
fhir-terminology-mvp/
├── backend/                 # FastAPI backend
│   ├── app.py              # Main application
│   ├── requirements.txt    # Python dependencies
│   └── run.sh             # Backend startup script
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── App.jsx       # Main application
│   │   └── main.jsx      # Entry point
│   ├── package.json      # Node dependencies
│   └── run.sh           # Frontend startup script
├── data/                  # Sample data files
│   ├── namaste.json      # NAMASTE terminology
│   ├── icd11.json        # ICD-11 codes
│   ├── conceptmap.json   # Mappings
│   └── patients.json     # Demo patients
├── samples/               # FHIR examples
│   ├── codesystem-namaste.json
│   ├── conceptmap-namaste-to-icd11.json
│   ├── bundle-example.json
│   └── condition-dual-coded.json
├── docker-compose.yml     # Container orchestration
├── Dockerfile            # Multi-stage build
└── README.md            # This file
\`\`\`

## 🎯 Hackathon Judging Criteria

### ✅ Technical Implementation
- **FHIR R4 Compliance**: Full CodeSystem, ConceptMap, Bundle support
- **Dual-Coding**: NAMASTE + ICD-11 (TM2 + Biomed) in single Condition
- **No External Dependencies**: All data in local JSON files
- **Mock Authentication**: ABHA token simulation with audit trail

### ✅ User Experience
- **Intuitive Interface**: Clear terminology search and mapping visualization
- **Real-time Feedback**: Confidence indicators and system badges
- **Workflow Integration**: Search → Problem List → FHIR Bundle → Audit
- **Error Handling**: Graceful degradation and user feedback

### ✅ Innovation & Impact
- **Traditional Medicine Integration**: Bridging ancient and modern healthcare
- **Curator Workflow**: Human-in-the-loop mapping approval
- **AI Chat Interface**: Natural language to structured codes
- **Interoperability**: Standards-compliant FHIR resources

### ✅ Scalability & Governance
- **Version Control**: ConceptMap versioning with curator tracking
- **Audit Compliance**: Complete activity logging with consent tracking
- **Analytics Dashboard**: Coverage metrics and quality indicators
- **Extensible Architecture**: Plugin-ready for additional terminologies

## 🚀 Future Enhancements

### Phase 2 Features
- **Real Database**: PostgreSQL with Supabase integration
- **Advanced ML**: Transformer-based semantic matching
- **Multi-language**: Support for regional language variants
- **Real ABHA**: Production ABHA authentication integration

### Phase 3 Scaling
- **FHIR Server**: Full terminology server implementation
- **Blockchain Audit**: Immutable mapping provenance
- **Mobile App**: React Native companion app
- **API Gateway**: Rate limiting and analytics

## 📞 Support & Contact

For hackathon judges or technical questions:
- **Demo Issues**: Check browser console and backend logs
- **API Testing**: Use included curl examples or Postman collection
- **Data Questions**: All sample data is in `/data` directory
- **FHIR Validation**: Use official FHIR validator against `/samples`

## 📄 License

MIT License - Built for hackathon demonstration purposes.

---

**🏆 Ready for Demo**: This MVP demonstrates a complete FHIR-compliant terminology microservice with modern UI, traditional medicine integration, and production-ready architecture patterns.
