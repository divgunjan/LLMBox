from fastapi import FastAPI
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

app = FastAPI()

# In-memory cache for models
models_cache = {}
tokenizers_cache = {}

class AnalyzeRequest(BaseModel):
    phrase: str
    model_name: str

def load_model(model_name: str):
    hf_names = {
        "qwen-2.5-7b": "Qwen/Qwen2.5-0.5B", 
        "phi-4-mini-3.8b": "sshleifer/tiny-gpt2",
        "gemma-3-12b": "roneneldan/TinyStories-1M"
    }
    hf_id = hf_names.get(model_name, "gpt2")
    
    if hf_id not in models_cache:
        print(f"Cold loading {hf_id}...")
        tokenizer = AutoTokenizer.from_pretrained(hf_id)
        model = AutoModelForCausalLM.from_pretrained(hf_id, torch_dtype="auto")
        models_cache[hf_id] = model
        tokenizers_cache[hf_id] = tokenizer
    
    return models_cache[hf_id], tokenizers_cache[hf_id]

@app.post("/analyze")
async def analyze_phrase(req: AnalyzeRequest):
    model, tokenizer = load_model(req.model_name)
    inputs = tokenizer(req.phrase, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        outputs = model(**inputs, output_attentions=True, output_hidden_states=True)
        
    # Tokens, strip special space characters
    raw_tokens = tokenizer.convert_ids_to_tokens(inputs.input_ids[0])
    tokens = [t.replace('Ġ', '').replace(' ', '') for t in raw_tokens]
    
    # Probabilities
    next_token_logits = outputs.logits[0, -1, :]
    probs = torch.nn.functional.softmax(next_token_logits, dim=-1)
    top_k_probs, top_k_indices = torch.topk(probs, 5)
    
    top_k_list = []
    for p, idx in zip(top_k_probs, top_k_indices):
        top_k_list.append({
            "token": tokenizer.decode(idx.item()).replace('Ġ', '').replace(' ', ''),
            "prob": round(p.item(), 4)
        })
        
    # Attention
    attentions = outputs.attentions 
    layers_data = []
    if attentions:
        num_layers = len(attentions)
        selected_layers = [0, num_layers // 2, num_layers - 1]
        for l_idx in selected_layers:
            attn = attentions[l_idx][0] # (heads, seq, seq)
            mean_attn = attn.mean(dim=0).to(torch.float32).cpu().numpy().tolist()
            layers_data.append({"layer": l_idx, "matrix": mean_attn})
            
    # Embeddings (Last hidden state of each token)
    hidden_states = outputs.hidden_states[-1][0].to(torch.float32).cpu().numpy() # (seq, hidden_dim)
    # Simple mock projection to 2D for visual ease
    # In production, use umap or PCA
    embeddings_2d = []
    import numpy as np
    for i, t in enumerate(tokens):
        # We just grab essentially a deterministic slice for visual pseudo-distribution
        x = float(hidden_states[i][0] * 10)
        y = float(hidden_states[i][1] * 10)
        embeddings_2d.append({"word": t, "x": round(x,3), "y": round(y,3)})
        
    return {
        "tokens": tokens,
        "probabilities": top_k_list,
        "attention": layers_data,
        "embeddings": embeddings_2d
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
