import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Initialize Gemini with your environment variable key
const API_KEY = process.env.GEMINI_API_KEY || process.env.ai_key;
const genAI = new GoogleGenerativeAI(API_KEY);

// Controller function
export const getDailyInsightController = async (req, res) => {
  try {
    if (!API_KEY) {
      console.error("GEMINI_API_KEY is missing from environment variables!");
      return res.status(500).json({ error: "Server API key missing" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Give me one current, interesting fact about diet, exercise, or general wellness. Format your response by clearly bolding the title (2-5 words) followed by a short, simple paragraph of 1-2 sentences. Avoid markdown headings.";

    const result = await model.generateContent(prompt);
    const factText = result.response.text();

    res.json({ fact: factText });
  } catch (err) {
    console.error("Error generating daily insight:", err);
    res.status(500).json({ error: "Failed to generate daily insight" });
  }
};

const homeWay = express.Router();

// Serves the homepage HTML
homeWay.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'home.html'));
});

// 2. Updated path to match the HTML fetch: /ai/daily-insight
homeWay.get("/ai/daily-insight", getDailyInsightController);

export default homeWay;
