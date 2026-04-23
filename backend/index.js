import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let currentAnswer = "";

// ✅ GET PUZZLE
app.get("/get-puzzle", (req, res) => {
  const puzzle = {
    question: "Fix the missing console log syntax.",
    code: "console.log('Hello'",
    answer: "console.log('Hello')"
  };

  currentAnswer = puzzle.answer;
  res.json(puzzle);
});

// ✅ VERIFY (FIXED)
app.post("/verify", (req, res) => {

  const normalize = (str) =>
    str.replace(/\s/g, "").replace(/;$/, "");

  const userAnswer = normalize(req.body.answer)
  const correctAnswer = normalize(currentAnswer);

  if (userAnswer === correctAnswer) {
    res.json({ correct: true });
  } else {
    console.log("Expected:", correctAnswer);
    console.log("Got:", userAnswer);
    res.status(400).json({ correct: false });
  }
});

// ✅ START SERVER
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});