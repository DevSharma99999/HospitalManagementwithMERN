// const GoogleGenerativeAI = await import("@google/generative-ai");
// import readlineSync from "readline-sync";
//  const genAI = new GoogleGenerativeAI("AIzaSyBEWFgaeYizzdxnNuTHdyMaDuh6QbEkQkw");

// let genAI;
// (async () => {
//   const { GoogleGenerativeAI } = await import("@google/generative-ai");
//   genAI = new GoogleGenerativeAI("AIzaSyBEWFgaeYizzdxnNuTHdyMaDuh6QbEkQkw"); // Replace with your key
// })();
import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = process.env.ai_key; 
const genAI = new GoogleGenerativeAI(API_KEY); // Replace with your ke

export const aiusercontroller=(req,res,next)=>{
    console.log(req.url,req.method,req.body);
    console.log("hfjsvdjh");
    // res.sendFile('check.ejs',{root:'views'});
    // res.sendFile('c2.html',{root:'views'});
    res.render("check");
};


export const resultscontroller = async (req, res, next) => {
  try {
    const healthProblem = req.body.healthProblem;

    // Wait until genAI is ready
    if (!genAI) {
      return res.status(500).json({ error: "AI not initialized yet. Try again in a moment." });
    }

    // Create Gemini model instance
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prompt for Gemini
    const prompt = `
You are a certified nutritionist.
Give a 7-day nutrition plan for a person suffering from "${healthProblem}".
Each day should have one line only, with a healthy food suggestion.
Use plain text format like:
Monday: ...
Tuesday: ...
(avoid markdown, bullets, or headings)
`;

    // Generate content from Gemini
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    // Convert AI response (plain text) to array of { day, food }
    const nutritionPlan = aiResponse.split("\n")
      .filter(line => line.trim() !== "")
      .map(line => {
        const [day, ...foodParts] = line.split(":");
        return { day: day.trim(), food: foodParts.join(":").trim() };
      });

    // Render the 'results' view with AI-generated plan
    res.render("results", {
      healthProblem,
      nutritionPlan
    });

  } catch (err) {
    console.error("Error in resultscontroller:", err);
    res.status(500).json({ error: "Something went wrong while generating the nutrition plan." });
  }
};


export const chatcontroller = async(req,res,next)=>{
    try {
    if (!genAI) {
      return res.status(500).json({ error: "AI not initialized yet. Try again in a moment." });
    }

    const userMsg = req.body.message;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a professional nutritionist.
Give exactly 5 short, clear, factual bullet points about: ${userMsg}
Avoid markdown, headings, or numbers. Only use plain text bullets.
Example format:
• Eat more green vegetables.
• Drink plenty of water.
• Reduce processed sugar.`;
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log("Bot:", response, "\n");
    res.json({ response });

  } catch (err) {
    console.error("Error in chatcontroller:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};




