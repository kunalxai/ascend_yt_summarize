import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY_TEST });

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

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 2000,
  });

  const raw = response.choices[0]?.message?.content?.trim();

  try {
    return JSON.parse(raw);
  } catch {
    // Strip accidental markdown fences if model misbehaves
    const cleaned = raw.replace(/```json|```/gi, "").trim();
    return JSON.parse(cleaned);
  }
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

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 3000,
  });

  const raw = response.choices[0]?.message?.content?.trim();

  try {
    return JSON.parse(raw);
  } catch {
    const cleaned = raw.replace(/```json|```/gi, "").trim();
    return JSON.parse(cleaned);
  }
}