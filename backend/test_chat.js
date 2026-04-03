import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/chat';

// Test cases: on-topic and off-topic questions
const testQuestions = [
  {
    name: "On-topic: Tokenization",
    messages: [
      { role: "user", content: "What is tokenization and why is it important for LLMs?" },
      { role: "assistant", content: "Tokenization..." }
    ],
    expectOnTopic: true
  },
  {
    name: "On-topic: Attention mechanisms",
    messages: [
      { role: "user", content: "Explain how attention mechanisms work in transformers" },
      { role: "assistant", content: "Attention..." }
    ],
    expectOnTopic: true
  },
  {
    name: "On-topic: Embeddings",
    messages: [
      { role: "user", content: "What are vector embeddings and how do they represent tokens?" },
      { role: "assistant", content: "Embeddings..." }
    ],
    expectOnTopic: true
  },
  {
    name: "Off-topic: General knowledge",
    messages: [
      { role: "user", content: "Who is Elon Musk?" },
      { role: "assistant", content: "..." }
    ],
    expectOnTopic: false
  },
  {
    name: "Off-topic: Weather",
    messages: [
      { role: "user", content: "What is the weather today?" },
      { role: "assistant", content: "..." }
    ],
    expectOnTopic: false
  },
  {
    name: "On-topic: OSS Models",
    messages: [
      { role: "user", content: "Tell me about the LLaMA model architecture" },
      { role: "assistant", content: "LLaMA..." }
    ],
    expectOnTopic: true
  }
];

async function runTests() {
  console.log('🧪 Starting Chat API Tests...\n');
  
  let passed = 0;
  let failed = 0;

  for (const test of testQuestions) {
    try {
      console.log(`Testing: ${test.name}`);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: test.messages })
      });

      const data = await response.json();
      const reply = data.reply || '';
      
      // Check token count estimate
      const wordCount = reply.split(/\s+/).filter(w => w).length;
      const tokenEstimate = Math.ceil(wordCount * 1.3);
      
      // Verify response
      const isValid = reply.length > 0;
      const withInTokenLimit = tokenEstimate <= 120; // Allow slight overage
      
      // Check if response is appropriate for topic
      const isAppropriate = test.expectOnTopic 
        ? (!reply.toLowerCase().includes("apologize") && reply.length > 50)
        : (reply.toLowerCase().includes("apologize") || reply.toLowerCase().includes("specialized"));

      const testPassed = isValid && isAppropriate;

      if (testPassed) {
        console.log(`✅ PASS`);
        passed++;
      } else {
        console.log(`❌ FAIL`);
        failed++;
      }
      
      console.log(`   Word Count: ${wordCount} | Token Est: ~${tokenEstimate}`);
      console.log(`   Response: "${reply.substring(0, 100)}${reply.length > 100 ? '...' : ''}"`);
      console.log();

    } catch (error) {
      console.log(`❌ ERROR: ${error.message}\n`);
      failed++;
    }

    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${((passed / testQuestions.length) * 100).toFixed(1)}%`);
}

runTests();
