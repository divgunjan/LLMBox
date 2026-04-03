---
description: Build an LLM Architecture Explainer Web App
---

# LLM Architecture Explainer Workflow

This workflow outlines the step-by-step process for building a visual, educational web application that illustrates how LLMs work ("how LLMs think/dream") behind the scenes.

## 1. Project Initialization & Tech Stack Verification
- **Frontend**: React (Vite), D3.js, Recharts
- **Backend**: Node.js + Express
- **Python Sidecar**: FastAPI (for extracting attention weights)
- **Model Server**: Ollama (local runner)
- **Database**: PostgreSQL (for caching and static copy)

## 2. Infrastructure Setup & Database Configurations
- **PostgreSQL Setup**: Initialize tables for `response_cache`, `concepts` (section copy and examples), and `popular_phrases`.
- **Model Setup**: Pull base OSS models (2.5B - 15B) in Ollama (e.g., Qwen 2.5 7B, Phi-4 Mini 3.8B, Gemma 3 12B).
- **Stateless Approach**: Confirm no authentication or sign-ups are implemented, focusing strictly on education.

## 3. Python FastAPI Sidecar (Attention Extraction)
Since standard Ollama APIs do not expose attention weights directly, a dedicated Python service is required:
- Initialize a FastAPI server (e.g., on port 8001).
- Implement an in-memory model cache to manage HuggingFace models corresponding to the Ollama models.
- Create a `POST /attention` endpoint that accepts `{ phrase, model_name }`.
- Run `model.forward(output_attentions=True)` using `AutoTokenizer` and `torch.no_grad()`.
- Extract, reduce (e.g., mean across heads), and extract specific layers.
- Return a JSON response structured as `{ tokens, layers: [{matrix}] }`.

## 4. Node.js & Express API Gateway
- Setup rate limiting (`express-rate-limit`) to prevent abuse of the public APIs.
- Implement the core endpoints:
  - `POST /api/predict`: Interfaces with Ollama's `/api/generate` to get logprobs and next-token predictions.
  - `POST /api/embed`: Interfaces with Ollama's `/api/embeddings` to fetch token vector data.
  - `POST /api/attention`: Interfaces with the Python sidecar running on port 8001.
- Write a unified orchestration controller that merges data using concurrent requests (e.g., `Promise.all()`).
- Implement a Postgres caching layer to speed up identical semantic queries (~800ms total latency).

## 5. React Frontend Engineering
- **Global State**: Track the selected model (from a dropdown) and the active input phrase.
- **Section Navigation**: Create components to tab through different concepts: "Vector Embeddings", "Attention Mechanism", and "Probability/Tokens".
- **Visualizations (The Core Experience)**:
  - **Probability Function (Next-token)**: Use **Recharts** to render a horizontal bar chart displaying the calculated probabilities of what word comes next (e.g. "she threw her warm" -> blanket: 45%, jacket: 30%, coat: 15%).
  - **Attention Mechanism**: Use **D3.js** to build an interactive matrix heatmap that visualizes the attention weights between words in the phrase.
  - **Vector Embeddings**: Render a 2D scatter plot using **D3.js** to map token embeddings to coordinates, showcasing spatial relationships between concepts.
  
## 6. Testing, Caching & Polish
- Verify end-to-end integration across Node.js, Ollama, Sidecar, and the DB cache.
- Ensure the fallback pipeline (cold logic vs cache) works optimally.
- Apply high-quality CSS/UI polishing to ensure the graphs are intuitive and educational for lay users.
