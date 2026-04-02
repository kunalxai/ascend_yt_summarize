import 'dotenv/config';
import { groqFetch } from './groqClient.js';

const MODEL = 'llama-3.3-70b-versatile';

function parseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const cleaned = raw.replace(/```json|```/gi, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse JSON response from Groq');
    }
  }
}

// ─── FLASHCARDS ───────────────────────────────────────────────
export async function generateFlashcards(summary) {
  const prompt = `You are an expert educator. Based on the following summary, generate between 10 to 20 flashcards depending on the complexity and density of the topic. Simple topics get 10, highly technical or dense topics get up to 20.

Each flashcard must have:
- "front": a concise concept, term, or question
- "back": a clear, accurate explanation or answer

Return ONLY a raw JSON array. No markdown, no code blocks, no explanation. Just the array.

Example format:
[{"front": "What is X?", "back": "X is ..."},...]

Summary:
${summary}`;

  const data = await groqFetch(
    {
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 2000,
    },
    process.env.GROQ_API_KEY_TEST
  );

  const raw = data.choices[0]?.message?.content?.trim();
  return parseJSON(raw);
}

// ─── QUIZ ─────────────────────────────────────────────────────
export async function generateQuiz(summary) {
  const prompt = `You are an expert educator. Based on the following summary, generate exactly 10 multiple choice questions to test understanding.

Each question must have:
- "question": the question string
- "options": an array of exactly 4 strings, each starting with "A) ", "B) ", "C) ", "D) "
- "answer": the correct option letter only, e.g. "A"
- "explanation": a brief explanation of why that answer is correct

Return ONLY a raw JSON array. No markdown, no code blocks, no explanation. Just the array.

Example format:
[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"A","explanation":"..."},...]

Summary:
${summary}`;

  const data = await groqFetch(
    {
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 3000,
    },
    process.env.GROQ_API_KEY_TEST
  );

  const raw = data.choices[0]?.message?.content?.trim();
  return parseJSON(raw);
}