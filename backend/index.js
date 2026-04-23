import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ✅ NORMALIZE FUNCTION (The "Fuzzy" Logic)
const normalize = (str) => {
  if (!str) return '';
  return str
    .replace(/\s+/g, '') // Remove all whitespace
    .replace(/['"‘“’”]/g, "'") // Normalize quotes
    .replace(/;/g, '') // Remove all semicolons
    .toLowerCase()
    .trim();
};

// ✅ GET PUZZLE
app.get('/get-puzzle', async (req, res) => {
  try {
    const prompt = `Generate a short JS syntax puzzle. 
    Return ONLY a JSON object: {"question": "...", "code": "...", "answer": "..."}. 
    No markdown, no newlines.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    const cleanText = text
      .replace(/```json|```/g, '')
      .replace(/\n|\r/g, '')
      .trim();
    const puzzle = JSON.parse(cleanText);

    res.json(puzzle);
  } catch (error) {
    console.error('Gemini Error:', error);
    res.json({
      question: 'Fix the missing console log syntax.',
      code: "console.log('Hello' ",
      answer: "console.log('Hello')",
    });
  }
});

// ✅ VERIFY
app.post('/verify', (req, res) => {
  // Pulling 'answer' and 'expected' from the body (Matches Sanchay's code)
  const { answer, expected } = req.body;

  const userAnswer = normalize(answer);
  const correctAnswer = normalize(expected);

  console.log('--- Verification Debug ---');
  console.log('User:', `[${userAnswer}]`);
  console.log('Correct:', `[${correctAnswer}]`);

  if (userAnswer === correctAnswer) {
    res.json({ success: true }); // Matches verifyData.success in extension
  } else {
    res.json({ success: false });
  }
});

app.listen(3000, () => {
  console.log('Chef is cooking at http://localhost:3000');
});
