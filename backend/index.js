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

function buildFallbackChatReply(userInput = "") {
  const q = String(userInput).toLowerCase();

  const isOnTopic =
    /(token|tokenization|embedding|attention|transformer|llm|next[- ]?token|mistral|llama|qwen|oss model|architecture|parameter|parameters|context|homograph|homographs)/i.test(
      q
    );

  if (!isOnTopic) {
    return "I'm specialized only in LLM architecture. Ask me about tokenization, embeddings, attention mechanisms, parameters, context understanding, homographs, transformer blocks, or OSS models like LLaMA, Qwen, and Mistral.";
  }

  if (q.includes('token')) {
    return "Tokenization splits text into model-readable units called tokens. The model predicts the next token step by step. Better tokenization improves context handling, vocabulary coverage, and generation quality.";
  }

  if (q.includes('embedding')) {
    return "Embeddings are dense vectors that encode token meaning in a numeric space. Similar words end up near each other, helping the model reason about semantic relationships before attention is applied.";
  }

  if (q.includes('attention')) {
    return "Attention lets each token weigh other tokens by relevance. In transformers, this creates context-aware representations so the model can focus on important words when predicting the next token.";
  }

  if (q.includes('parameter')) {
    return "Parameters are learned weights in the model. More parameters usually increase capacity to represent patterns, but quality also depends on training data, architecture, and optimization, not just model size.";
  }

  if (q.includes('context')) {
    return "Context understanding comes from self-attention over the input sequence. The model uses surrounding tokens to resolve meaning, track dependencies, and choose the most likely next token within the context window.";
  }

  if (q.includes('homograph')) {
    return "Homographs are words with the same spelling but different meanings, like 'bank'. LLMs disambiguate them using context signals from nearby tokens through attention and contextual embeddings.";
  }

  return "LLM architecture combines tokenization, embeddings, parameters, transformer attention, context understanding, homograph disambiguation, and next-token prediction. Ask a specific question and I will explain that part in a concise way.";
}

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
    
    // Check if running in Vercel production environment
    const isProduction = !!process.env.VERCEL || process.env.NODE_ENV === 'production';

    if (isProduction) {
      // Mock Data Generation for Vercel 
      const rawTokens = phrase.split(/(?=[_ ]|\b)/).filter(t => t.trim().length > 0 || t === ' ');
      const tokens = rawTokens.map(t => t.trim() === '' ? t : t.replace(' ', ''));
      
      const probabilities = [
        { token: " and", prob: 0.1500 },
        { token: " the", prob: 0.0800 },
        { token: ".", prob: 0.0500 },
        { token: " is", prob: 0.0400 },
        { token: ",", prob: 0.0300 }
      ];

      // Generate mock attention matrices
      const attention = [0, 6, 11].map(layer => ({
        layer,
        matrix: tokens.map((_, i) => tokens.map((_, j) => {
           // Emulate diagonal strong attention and first-token attention
           return (i === j ? 0.4 : (j === 0 ? 0.2 : Math.random() * 0.1));
        }))
      }));

      // Generate mock embeddings
      const embeddings = tokens.map(t => ({
        word: t,
        x: Number((Math.random() * 20 - 10).toFixed(3)),
        y: Number((Math.random() * 20 - 10).toFixed(3))
      }));

      return res.json({
        tokens,
        probabilities,
        attention,
        embeddings
      });
    }

    // Local environment: The Python sidecar takes care of the probabilities, embeddings, and attention
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

// Helper function to count approximate tokens (1 token ≈ 1 word for LLM approximation)
function countTokens(text) {
  return Math.ceil(text.split(/\s+/).filter(w => w).length * 1.3);
}

// Helper function to truncate text to approximate token limit
function truncateToTokenLimit(text, maxTokens = 100) {
  const words = text.split(/\s+/).filter(w => w);
  let currentTokens = 0;
  let truncatedWords = [];
  
  for (let word of words) {
    const wordTokenEstimate = Math.ceil(word.length / 4) + 1; // rough estimate
    if (currentTokens + wordTokenEstimate > maxTokens) {
      break;
    }
    truncatedWords.push(word);
    currentTokens += wordTokenEstimate;
  }
  
  return truncatedWords.length > 0 ? truncatedWords.join(' ') : text.substring(0, 200);
}

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
      systemInstruction: `You are an expert in LLM Architecture Explainer - a specialization in:
- Tokenization and text-to-token conversion
- Vector embeddings and semantic representation
- Attention mechanisms in transformers
- Parameters (what they are and how scale affects capability)
- Context understanding and context windows
- Homographs and context-based disambiguation
- Next-token prediction
- Open Source Software (OSS) models like LLaMA, Qwen, Mistral, Falcon
- Transformer architecture fundamentals
- Neural network concepts related to LLMs

STRICT RULES:
1. ONLY answer questions about these specific topics
2. Keep responses VERY SHORT - maximum 100 tokens (roughly 75 words)
3. Be concise and educational
4. If a user asks a general/off-topic question (e.g., "Who is Elon Musk?", "What is the weather?"), you MUST:
   - Politely decline
  - State: "I'm specialized only in LLM Architecture. I can help with tokenization, embeddings, attention mechanisms, parameters, context understanding, homographs, and model architectures."
   - Suggest an on-topic question

Always refer to the project visually: tokenization breaks text into tokens, embeddings place tokens in vector space, attention shows which tokens matter to each other.`,
    });

    const chat = model.startChat({
      history: history,
    });

    let result = await chat.sendMessage(latestMessage);
    let response = await result.response;
    let text = response.text();

    // Enforce token limit: truncate if exceeds 100 tokens
    const tokenCount = countTokens(text);
    if (tokenCount > 100) {
      text = truncateToTokenLimit(text, 100);
    }

    // If response seems off-topic or too vague, add clarification
    if (text.includes("I'm not able to") || text.includes("I can't help") || text.includes("I don't have information")) {
      text = "I'm specialized only in LLM Architecture. I can help with tokenization, embeddings, attention mechanisms, parameters, context understanding, homographs, and transformer models. What would you like to know?";
    }

    console.log(`[Chat] Token count: ${tokenCount} | Response length: ${text.length} chars`);

    res.json({ reply: text });
  } catch (error) {
    console.error('Error in chat API:', error);
    const messages = req.body?.messages || [];
    const latestMessage =
      messages.length > 0 && typeof messages[messages.length - 1]?.content === 'string'
        ? messages[messages.length - 1].content
        : '';

    const fallbackReply = buildFallbackChatReply(latestMessage);
    res.json({
      reply: fallbackReply,
      source: 'fallback',
      error: 'Gemini unavailable; served fallback response',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API Gateway running on http://localhost:${PORT}`);
});
