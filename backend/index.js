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

// 🧠 MEMORY (avoid repeats)
let lastQuestion = "";

// ✅ NORMALIZE (your logic kept)
const normalize = (str) => {
  if (!str) return '';
  return str
    .replace(/\s+/g, '')
    .replace(/['"‘“’”]/g, "'")
    .replace(/;/g, '')
    .toLowerCase()
    .trim();
};

// 🎯 FALLBACK POOL (dynamic)
const fallbackPuzzles = [
  {
    question: "Fix the missing console log syntax.",
    code: "console.log('Hello'",
    answer: "console.log('Hello')",
    difficulty: "Easy"
  },
  {
    question: "Fix variable declaration.",
    code: "let x = 5 console.log(x)",
    answer: "let x = 5; console.log(x)",
    difficulty: "Easy"
  },
  {
    question: "Fix loop syntax.",
    code: "for(i=0 i<5 i++)",
    answer: "for(i=0; i<5; i++)",
    difficulty: "Medium"
  },
  {
    question: "Fix function syntax.",
    code: "function greet { return 'Hi'; }",
    answer: "function greet() { return 'Hi'; }",
    difficulty: "Medium"
  },
  {
    question: "Fix async function syntax.",
    code: "async function fetchData { return await fetch(url); }",
    answer: "async function fetchData() { return await fetch(url); }",
    difficulty: "Hard"
  }
];

// 🎯 HELPER → get non-repeating fallback
const getFallback = () => {
  let puzzle;
  do {
    puzzle = fallbackPuzzles[Math.floor(Math.random() * fallbackPuzzles.length)];
  } while (puzzle.question === lastQuestion);

  lastQuestion = puzzle.question;
  return puzzle;
};

// 🚀 GET PUZZLE
app.get('/get-puzzle', async (req, res) => {
  try {
    const prompt = `
Generate a UNIQUE JavaScript syntax debugging puzzle.

Rules:
- Must NOT be a simple console.log example
- Use different concepts (loops, functions, async, variables)
- Keep it short and solvable
- Avoid repeating common examples

Return ONLY JSON:
{"question":"...","code":"...","answer":"...","difficulty":"Easy/Medium/Hard"}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    const cleanText = text
      .replace(/```json|```/g, '')
      .replace(/\n|\r/g, '')
      .trim();

    const puzzle = JSON.parse(cleanText);

    // 🧠 Avoid repeat
    if (puzzle.question === lastQuestion) {
      throw new Error("Duplicate question");
    }

    lastQuestion = puzzle.question;

    res.json({
      question: puzzle.question,
      code: puzzle.code,
      difficulty: puzzle.difficulty || "Medium",
      expected: puzzle.answer // 👈 IMPORTANT for your extension
    });

  } catch (error) {
    console.error('Gemini Error → Using fallback:', error.message);

    const fallback = getFallback();

    res.json({
      question: fallback.question,
      code: fallback.code,
      difficulty: fallback.difficulty,
      expected: fallback.answer // 👈 IMPORTANT
    });
  }
});

// ✅ VERIFY (your version, unchanged logic)
app.post('/verify', (req, res) => {
  const { answer, expected } = req.body;

  const userAnswer = normalize(answer);
  const correctAnswer = normalize(expected);

  console.log('--- Verification Debug ---');
  console.log('User:', `[${userAnswer}]`);
  console.log('Correct:', `[${correctAnswer}]`);

  if (userAnswer === correctAnswer) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.listen(3000, () => {
  console.log('🔥 Chef is cooking at http://localhost:3000');
});