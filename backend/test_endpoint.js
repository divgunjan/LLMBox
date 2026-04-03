import fetch from 'node-fetch';

fetch("http://localhost:3000/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages: [{ role: "user", content: "What is an LLM embedding?" }] })
})
.then(async r => {
  console.log("Status:", r.status);
  console.log("Text:", await r.text());
})
.catch(console.error);
