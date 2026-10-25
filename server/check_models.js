import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    await model.generateContent("hello");
    console.log("gemini-1.5-flash works");
  } catch (e) {
    console.log("gemini-1.5-flash error:", e.message);
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    await model.generateContent("hello");
    console.log("gemini-1.5-pro works");
  } catch (e) {
    console.log("gemini-1.5-pro error:", e.message);
  }
}

listModels();
