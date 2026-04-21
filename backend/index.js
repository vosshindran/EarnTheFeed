import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// 1. Import the Google Generative AI library
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 2. Initialize Gemini with your API Key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

app.get('/', (req, res) => {
  res.send('EarnTheFeed backend is running 🚀');
});

// 3. The "Brain" Route: Generates a puzzle for the extension
app.get('/get-puzzle', async (req, res) => {
  try {
    const prompt = `Generate a very short JavaScript syntax puzzle for a beginner. 
    Return ONLY a raw JSON object with these keys: 
    "question" (string), "code" (string with a mistake), "answer" (the corrected string). 
    Do not use markdown blocks like \`\`\`json. Just the raw text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Convert the AI's text response into an actual JSON object
    const puzzle = JSON.parse(text);
    res.json(puzzle);
  } catch (error) {
    console.error('Gemini Error:', error);
    // 4. Fallback: If the API is down/slow, the demo still works!
    res.json({
      question: 'Fix the missing console log syntax.',
      code: "console.log('Hello' ",
      answer: "console.log('Hello')",
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
