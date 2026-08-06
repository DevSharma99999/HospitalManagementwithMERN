import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple in-memory cache
let cachedFact = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Fallback facts if API is rate-limited or quota is exceeded
const fallbackFacts = [
  "**Stay Hydrated** Drinking adequate water boosts metabolic rate and supports optimal digestive function throughout the day.",
  "**Prioritize Sleep** Getting 7-9 hours of quality sleep enhances cognitive performance and strengthens immune system efficiency.",
  "**Daily Movement** Even a brisk 15-minute daily walk significantly lowers cardiovascular risks and improves mental clarity."
];

export const getDailyInsightController = async (req, res) => {
  const currentTime = Date.now();

  // 1. Return cached fact if it's still fresh (< 1 hour old)
  if (cachedFact && (currentTime - lastFetchTime < CACHE_DURATION)) {
    return res.json({ fact: cachedFact });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.ai_key;

    if (!apiKey) {
      // Fallback if key missing
      const randomFallback = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
      return res.json({ fact: randomFallback });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" }); // 1.5-flash-8b has higher free tier limits
    
    const prompt = "Give me one current, interesting fact about diet, exercise, or general wellness. Format your response by clearly bolding the title (2-5 words) followed by a short, simple paragraph of 1-2 sentences. Avoid markdown headings.";

    const result = await model.generateContent(prompt);
    factText = result.response.text();

    // Store in cache
    cachedFact = factText;
    lastFetchTime = currentTime;

    res.json({ fact: factText });

  } catch (err) {
    console.error("Gemini API Error / Quota Limit:", err.message || err);

    // 2. If Rate-Limited (429) or Error, return cached fact or static fallback gracefully!
    if (cachedFact) {
      return res.json({ fact: cachedFact });
    }

    const randomFallback = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
    res.json({ fact: randomFallback });
  }
};

const homeWay = express.Router();

homeWay.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'home.html'));
});

homeWay.get("/ai/daily-insight", getDailyInsightController);

export default homeWay;
