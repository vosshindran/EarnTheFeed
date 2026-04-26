import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

let currentAnswer = '';

// ✅ ROOT ROUTE
app.get('/', (req, res) => {
  res.send('Earn The Feed Backend is running! 🚀');
});

app.get('/ping', (req, res) => {
  res.json({ status: 'alive', timestamp: Date.now() });
});

// ✅ GET CHALLENGE (POWERED BY GEMINI)
app.get('/get-challenge', async (req, res) => {
  const type = req.query.type || 'coding';

  let prompt = '';
  if (type === 'coding') {
    prompt =
      'Generate a short JavaScript debugging challenge. The answer should be the corrected line or result. Return JSON: { "question": "description", "code": "buggy code", "answer": "correct code" }';
  } else if (type === 'puzzle') {
    prompt =
      'Generate a Tic-Tac-Toe winning move puzzle. Provide a 3x3 grid state where it is X\'s turn and there is exactly one winning move. Return JSON: { "question": "Find the winning move for X (0-8 index).", "code": "[Board as ASCII grid]", "answer": "the index number" }';
  } else if (type === 'workout') {
    const exercises = ['Pushups', 'Jumping Jacks'];
    const ex = exercises[Math.floor(Math.random() * exercises.length)];
    const reps = Math.floor(Math.random() * 6) + 10; // 10-15
    res.json({
      question: `Drop and give me ${reps} ${ex}!`,
      code: '',
      answer: 'DONE',
    });
    currentAnswer = 'DONE';
    return;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response (sometimes Gemini wraps JSON in markdown blocks)
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const challenge = JSON.parse(jsonStr);

    currentAnswer = challenge.answer;
    res.json(challenge);
  } catch (err) {
    console.error('Gemini Error:', err);
    // Type-specific fallback challenges
    let fallback;
    if (type === 'puzzle') {
      const puzzleFallbacks = [
        {
          question: 'Find the winning move for X (0-8 index).\n\n  X | O | X\n  ---------\n  O | X | O\n  ---------\n  _ | _ | _',
          code: 'Board positions:\n0 | 1 | 2\n---------\n3 | 4 | 5\n---------\n6 | 7 | 8',
          answer: '8'
        },
        {
          question: 'Find the winning move for X (0-8 index).\n\n  X | _ | O\n  ---------\n  _ | X | _\n  ---------\n  O | _ | _',
          code: 'Board positions:\n0 | 1 | 2\n---------\n3 | 4 | 5\n---------\n6 | 7 | 8',
          answer: '8'
        },
        {
          question: 'Find the winning move for X (0-8 index).\n\n  X | X | _\n  ---------\n  O | O | _\n  ---------\n  _ | _ | _',
          code: 'Board positions:\n0 | 1 | 2\n---------\n3 | 4 | 5\n---------\n6 | 7 | 8',
          answer: '2'
        },
        {
          question: 'Find the winning move for X (0-8 index).\n\n  O | _ | X\n  ---------\n  _ | O | _\n  ---------\n  X | _ | _',
          code: 'Board positions:\n0 | 1 | 2\n---------\n3 | 4 | 5\n---------\n6 | 7 | 8',
          answer: '8'
        }
      ];
      fallback = puzzleFallbacks[Math.floor(Math.random() * puzzleFallbacks.length)];
    } else {
      const codingFallbacks = [
        {
          question: 'Fix the missing parenthesis.',
          code: "console.log('Hello'",
          answer: "console.log('Hello')"
        },
        {
          question: 'What does this return?',
          code: "typeof null",
          answer: "object"
        },
        {
          question: 'Fix the typo in this array method.',
          code: "[1,2,3].lenght",
          answer: "[1,2,3].length"
        }
      ];
      fallback = codingFallbacks[Math.floor(Math.random() * codingFallbacks.length)];
    }
    currentAnswer = fallback.answer;
    res.json(fallback);
  }
});

// ✅ VERIFY
app.post('/verify', (req, res) => {
  const userAnswer = (req.body.answer || '').trim().toLowerCase();
  const correctAnswer = currentAnswer.trim().toLowerCase();

  // Remove all spaces for more flexible checking
  const cleanUser = userAnswer.replace(/\s/g, '');
  const cleanCorrect = correctAnswer.replace(/\s/g, '');

  if (cleanUser === cleanCorrect) {
    res.json({ correct: true });
  } else {
    res.status(400).json({ correct: false });
  }
});

// ✅ START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
