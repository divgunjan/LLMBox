# LLM Architecture Explainer

Welcome to the LLM Architecture Explainer! This is an interactive web application designed to intuitively visualize and explain the inner workings of Large Language Models (LLMs), including concepts like Tokenization, Vector Embeddings, Attention Mechanisms, and Next-Token Predictions.

## 🎬 Demo Video

[![Watch the demo](https://img.youtube.com/vi/Jj16E18yQTA/hqdefault.jpg)](https://youtu.be/Jj16E18yQTA)

Watch on YouTube: https://youtu.be/Jj16E18yQTA

## 🚀 Features
- **Interactive Visualizations**: Watch concepts map dynamically onto D3 vector embedding graphs.
- **Attention Mapping**: See exactly where the model focuses its attention per token.
- **Local AI Inference**: Uses Python to run precise token mathematics using real open-source models.
- **Built-in LLM Expert**: A floating, Gemini-powered assistant available at any time to answer your deeper architecture questions with well-formatted markdown.

## ⚠️ License and Copyright Restrictions
This repository is explicitly protected under a custom copyright license. It is publicly visible to serve as a portfolio demonstration and educational resource. 

By accessing this repository, you agree to the terms outlined in the `LICENSE` file.
- **You may**: Fork and clone this repository for your own personal viewing and educational learning.
- **You may NOT**: Edit and actively redistribute/publish the code, use it commercially, or claim this work as your own. 

## 💻 Tech Stack
- **Frontend**: React (Vite), D3.js, Tailwind CSS
- **Proxy Gateway**: Node.js, Express
- **AI sidecar**: Python, FastAPI, PyTorch
- **Chatbot integration**: Google Gemini 2.5 Flash API

## 🛠️ How to Run Locally

Follow these step-by-step instructions to get the LLM Architecture Explainer running on your Windows machine.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **[Node.js](https://nodejs.org/)** (v18 or higher) - Includes npm
   - Download from: https://nodejs.org/
   - Verify installation: Open Command Prompt and run `node --version` and `npm --version`

2. **[Python](https://www.python.org/)** (v3.8 or higher)
   - Download from: https://www.python.org/
   - Verify installation: Open Command Prompt and run `python --version`

3. **Git** (optional, for cloning the repository)
   - Download from: https://git-scm.com/

### Step 1: Clone or Fork the Repository

**Option A: Clone using Git**
```bash
git clone https://github.com/your-username/BlackBoxLLM.git
cd BlackBoxLLM
```

**Option B: Download as ZIP**
- Go to the GitHub repository and click "Code" → "Download ZIP"
- Extract the folder
- Open Command Prompt and navigate to the extracted folder

### Step 2: Install Dependencies

Open **Command Prompt** and navigate to the project root directory. Run the following commands:

```bash
# Install Frontend dependencies
cd frontend
npm install
cd ..

# Install Backend dependencies
cd backend
npm install
cd ..

# Set up Python Virtual Environment and install Python dependencies
cd sidecar
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

> **Note**: The Python virtual environment (`venv`) will be automatically activated when you use the `start.bat` script.

### Step 3: Configure Environment Variables (Optional)

If you're using the Gemini AI chatbot feature, ensure you have a valid Google Gemini API key set up:
- Check the `backend/index.js` and `frontend/src/app/components/FloatingChat.tsx` files for any environment variable configuration.

### Step 4: Launch the Application

The easiest way to start the entire application is to use the provided startup script:

#### **Double-Click `start.bat`**
1. Navigate to the project root directory
2. **Double-click the `start.bat` file**
3. This will automatically launch **three separate Command Prompt windows**:
   - **Frontend**: React development server (Vite) at `http://localhost:5173/`
   - **Backend**: Node.js API Gateway at `http://localhost:3000/`
   - **Sidecar**: Python FastAPI server for AI inference at `http://localhost:8001/`

#### Manual Launch (Alternative)
If you prefer to start services manually, open three separate Command Prompt windows and run:

```bash
# Window 1: Frontend (from project root)
cd frontend
npm run dev

# Window 2: Backend (from project root)
cd backend
node index.js

# Window 3: Sidecar (from project root)
cd sidecar
venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8001
```

### Step 5: Access the Application

Once all three services are running, open your web browser and navigate to:
```
http://localhost:5173/
```

You should see the LLM Architecture Explainer interface. Explore the interactive visualizations!

## ⚠️ Important Notes

- **Keep All Windows Open**: Do not close any of the three Command Prompt windows while using the application. Each window runs a critical service.
- **First Load**: The first time you load the app, it may take a few seconds as the Python sidecar initializes the AI model.
- **Port Conflicts**: If you see errors about ports already in use (5173, 3000, or 8001), make sure no other applications are using these ports.

## 🐛 Troubleshooting

### Issue: "npm command not found"
- **Solution**: Node.js is not installed or not in your system PATH. Reinstall [Node.js](https://nodejs.org/) and restart Command Prompt.

### Issue: "python command not found"
- **Solution**: Python is not installed or not in your system PATH. Reinstall [Python](https://www.python.org/) and make sure to check "Add Python to PATH" during installation.

### Issue: Port already in use (error on startup)
- **Solution**: Another application is using ports 5173, 3000, or 8001. Close the conflicting application or modify the port numbers in:
  - Frontend: `frontend/vite.config.ts`
  - Backend: `backend/index.js`
  - Sidecar: Update the port in the `start.bat` script

### Issue: "ModuleNotFoundError" in Python sidecar
- **Solution**: Virtual environment not activated or dependencies not installed. Ensure you ran `pip install -r requirements.txt` in the `sidecar` folder.

### Issue: Blank page or connection errors
- **Solution**: Check that all three services are running in their respective Command Prompt windows. Look for error messages in the windows and address them accordingly.

## 📁 Project Structure

- `frontend/` - React frontend application (Vite)
- `backend/` - Node.js Express API gateway
- `sidecar/` - Python FastAPI server for AI inference and token mathematics
- `db/` - Database files (if applicable)
- `design_app/` - UI design files
- `workflow/` - Workflow documentation
- `start.bat` - Startup script to launch all services

## 🚀 Next Steps

Once the application is running:-
1. Explore the **Tokenization** section to see how text is broken into tokens
2. Check the **Embeddings** section to visualize vector representations
3. Examine the **Attention Mechanisms** to understand how the model focuses on different tokens
4. Use the **Floating Chat** to ask questions about LLM architecture
