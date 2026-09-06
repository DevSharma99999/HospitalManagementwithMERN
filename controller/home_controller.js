import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || process.env.ai_key;
const ai = new GoogleGenAI({ apiKey: API_KEY });

const GEMINI_MODEL = process.env.GEMINI_MODEL_NAME || "gemini-3.6-flash";

export const aiusercontroller = (req, res, next) => {
    res.render("check");
};

export const resultscontroller = async (req, res, next) => {
  try {
    const healthProblem = req.body.healthProblem;

    if (!API_KEY) {
      console.error("Gemini API key missing — check GEMINI_API_KEY env var.");
      return res.status(500).render("error", {
        message: "AI service is not configured correctly. Please try again later."
      });
    }

    const prompt = `
You are a certified nutritionist.
Give a 7-day nutrition plan for a person suffering from "${healthProblem}".
Each day should have one line only, with a healthy food suggestion.
Use plain text format like:
Monday: ...
Tuesday: ...
(avoid markdown, bullets, or headings)
`;

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt
    });
    const aiResponse = result.text;

    const nutritionPlan = aiResponse.split("\n")
      .filter(line => line.trim() !== "")
      .map(line => {
        const [day, ...foodParts] = line.split(":");
        return { day: day.trim(), food: foodParts.join(":").trim() };
      });

    res.render("results", {
      healthProblem,
      nutritionPlan
    });

  } catch (err) {
    console.error("Error in resultscontroller:", err);
    res.status(500).render("error", {
      message: "Something went wrong while generating the nutrition plan. Please try again."
    });
  }
};

export const chatcontroller = async (req, res, next) => {
    try {
    if (!API_KEY) {
      return res.status(500).json({ error: "AI not initialized yet. Try again in a moment." });
    }

    const userMsg = req.body.message;

    const prompt = `You are a professional nutritionist.
Give exactly 5 short, clear, factual bullet points about: ${userMsg}
Avoid markdown, headings, or numbers. Only use plain text bullets.
Example format:
- Eat more green vegetables.
- Drink plenty of water.
- Reduce processed sugar.`;

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt
    });
    const response = result.text;

    res.json({ response });

  } catch (err) {
    console.error("Error in chatcontroller:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};