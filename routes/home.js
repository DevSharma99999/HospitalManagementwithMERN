import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getDailyInsightController = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.ai_key;

    if (!apiKey) {
      console.error("GEMINI_API_KEY / ai_key is missing!");
      return res.status(500).json({ error: "Server API key missing" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 💡 FIX: Use gemini-2.0-flash (or gemini-1.5-flash-8b)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = "Give me one current, interesting fact about diet, exercise, or general wellness. Format your response by clearly bolding the title (2-5 words) followed by a short, simple paragraph of 1-2 sentences. Avoid markdown headings.";

    const result = await model.generateContent(prompt);
    const factText = result.response.text();

    res.json({ fact: factText });
  } catch (err) {
    console.error("Error generating daily insight:", err.message || err);
    res.status(500).json({ error: "Failed to generate daily insight", details: err.message });
  }
};

const homeWay = express.Router();

homeWay.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'home.html'));
});

homeWay.get("/ai/daily-insight", getDailyInsightController);

export default homeWay;
