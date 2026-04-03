import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 100, 
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// Unified endpoint proxying the Python Sidecar
app.post('/api/analyze', async (req, res) => {
  try {
    const { phrase, model_name } = req.body;
    
    // The Python sidecar takes care of the probabilities, embeddings, and attention
    const sidecarResponse = await fetch('http://localhost:8001/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrase, model_name })
    });
    
    if (!sidecarResponse.ok) {
         throw new Error(`Sidecar responded with ${sidecarResponse.status}`);
    }
    
    const data = await sidecarResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Error in analyze gateway:', error);
    res.status(500).json({ error: 'Failed to extract LLM metadata' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    let history = (messages || []).slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    
    // Gemini api requires history to start with user
    if (history.length > 0 && history[0].role === 'model') {
      history = [{ role: 'user', parts: [{ text: 'Hello' }] }, ...history];
    }
    
    // Default to a fallback if there's no latest message
    const latestMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : "Hello";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are an expert in LLM architecture, vector embeddings, tokenization, attention mechanisms, and Open Source Software (OSS) models like LLaMA, Qwen, Mistral, etc. You must ONLY answer questions related to these specific topics. Explain concepts clearly but KEEP YOUR ANSWERS CONCISE AND SHORT. If a user asks a general question (e.g., 'Who is Elon Musk?'), you must politely refuse to answer, explicitly state that you are specialized only in LLM Architecture, and guide them back to the topic.",
    });

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(latestMessage);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API Gateway running on http://localhost:${PORT}`);
});
