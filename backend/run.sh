#!/bin/bash
echo "Starting FHIR Terminology Microservice Backend..."
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
