@echo off
echo Starting LLM Explainer...

echo Starting Frontend...
cd frontend
start cmd /k "npm run dev"
cd ..

echo Starting Backend API Gateway...
cd backend
start cmd /k "node index.js"
cd ..

echo Starting Python Attention Sidecar...
cd sidecar
start cmd /k ".\venv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8001"
cd ..

echo All services launched in their own windows!
