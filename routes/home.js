import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedFact = null;
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

const fallbackFacts = [
  "**Stay Hydrated** Drinking adequate water boosts metabolic rate and supports optimal digestive function throughout the day.",
  "**Prioritize Sleep** Getting 7-9 hours of quality sleep enhances cognitive performance and strengthens immune system efficiency.",
  "**Daily Movement** Even a brisk 15-minute daily walk significantly lowers cardiovascular risks and improves mental clarity."
];

// 🔧 Configurable via env var so a future model retirement is a dashboard
// change, not a code change + redeploy. Defaults to the current model.
const GEMINI_MODEL = process.env.GEMINI_MODEL_NAME || "gemini-1.5-turbo";

export const getDailyInsightController = async (req, res) => {
  const currentTime = Date.now();

  if (cachedFact && (currentTime - lastFetchTime < CACHE_DURATION)) {
    return res.json({ fact: cachedFact });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY ;

    if (!apiKey) {
      const randomFallback = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
      return res.json({ fact: randomFallback });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = "Give me one current, interesting fact about diet, exercise, or general wellness. Format your response by clearly bolding the title (2-5 words) followed by a short, simple paragraph of 1-2 sentences. Avoid markdown headings.";

    const result = await model.generateContent(prompt);
    const factText = result.response.text();

    cachedFact = factText;
    lastFetchTime = currentTime;

    res.json({ fact: factText });

  } catch (err) {
    console.error(`Gemini API Error (model: ${GEMINI_MODEL}):`, err.message || err);

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