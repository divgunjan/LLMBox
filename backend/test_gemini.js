import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "Test system instruction",
    });

    const chat = model.startChat({
      history: [],
    });

    const result = await chat.sendMessage("hello");
    const response = await result.response;
    console.log(response.text());
  } catch (err) {
    console.error("ERROR CAUGHT:");
    console.error(err);
  }
}

test();
