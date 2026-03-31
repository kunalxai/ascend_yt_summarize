import 'dotenv/config';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroq(systemPrompt, userMessage, maxTokens = 1024) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: maxTokens,
      temperature: 0.4
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(`Groq error: ${data.error.message}`);
  return data.choices[0].message.content.trim();
}

function splitIntoChunks(text, maxChunkSize = 3000) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChunkSize) {
      currentChunk += sentence + ' ';
    } else {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = sentence + ' ';
    }
  }

  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks;
}

async function summarizeChunk(text, chunkIndex, totalChunks, source) {
  console.log(`Summarizing chunk ${chunkIndex + 1} of ${totalChunks}...`);

  const sourceLabel = source === 'document' ? 'document' : 'YouTube video transcript';

  const system = `You are an expert educator and knowledge extractor. Your job is to extract the most valuable, precise information from a section of a ${sourceLabel}.

Your rules:
- Be precise — only include what is actually said, never add outside knowledge
- Skip filler words, repetition, jokes, and small talk
- Focus on facts, concepts, arguments, data points and examples
- Note any specific numbers, statistics or metrics mentioned
- Write in clear simple English that anyone can understand
- Be concise — quality over quantity`;

  const user = `This is part ${chunkIndex + 1} of ${totalChunks} of a ${sourceLabel}. Extract the key educational points from this section. Pay special attention to any numbers, statistics, metrics or data points.

Content:
${text}

Key points from this section:`;

  return await callGroq(system, user, 500);
}

async function combineNotes(notes, source) {
  if (notes.length === 1) return notes[0];

  console.log(`Combining ${notes.length} sets of notes...`);

  const sourceLabel = source === 'document' ? 'document' : 'YouTube video';

  const system = `You are an expert editor. Your job is to merge multiple sets of notes from different sections of a ${sourceLabel} into one clean, unified set of notes.

Your rules:
- Remove all repetition and redundancy
- Keep every unique insight, fact, metric or concept
- Preserve all specific numbers and statistics
- Maintain logical flow — group related points together
- Do not add any information that wasn't in the original notes`;

  const user = `Merge these notes from different sections of the same ${sourceLabel} into one unified set of key points. Preserve all numbers and metrics:

${notes.map((n, i) => `Section ${i + 1}:\n${n}`).join('\n\n')}

Unified notes:`;

  return await callGroq(system, user, 1000);
}

async function generateFinalSummary(mergedNotes, source) {
  console.log('Generating final learning summary...');

  const sourceLabel = source === 'document' ? 'document' : 'YouTube video';

  const system = `You are an expert educator creating a structured learning summary from a ${sourceLabel}. Your goal is to help the reader deeply understand and learn from the content — as if they had a knowledgeable teacher explain it to them personally.

Your rules:
- Write in a warm, engaging, educational tone — like a great teacher explaining to a curious student
- Be specific and precise — use exact facts, numbers, names and examples from the content
- Make insights actionable — help the reader understand WHY something matters and HOW they can use it
- Never be vague or generic — every sentence should teach something concrete
- Strip all markdown bold markers from your output — write plain clean text only
- Do not add outside knowledge — only teach what the ${sourceLabel} actually covers`;

  const user = `Based on these notes from a ${sourceLabel}, create a rich structured learning summary.

Use EXACTLY this format with these exact section headers:

## 🎯 What This Is About
(2-3 sentences explaining the core topic and why it matters. Hook the reader.)

## 📊 Key Metric
(Extract ONE specific number, stat or data point — e.g. "20 billion transactions per month". Write just the metric and a brief explanation. If none exists write "N/A".)

## 💬 Key Quote
(The single most insightful or memorable statement from the content. Use exact words if possible. If none, write the core argument in one powerful sentence.)

## 🧠 Core Concepts Explained
(Explain the 2-4 main ideas in simple terms. Write in short paragraphs with bullet points for sub-ideas. Use analogies where helpful. Teach each concept properly.)

## 💡 Key Insights & Takeaways
(5-7 bullet points starting with - of the most valuable non-obvious insights. Be specific — use numbers, names, examples.)

## ✅ What You Can Do With This
(3-5 bullet points starting with - of concrete actionable lessons. Start each with a verb.)

## 🔍 Questions To Think About
(2-3 bullet points starting with - of thought provoking questions that help the reader go deeper.)

Notes:
${mergedNotes}

Structured learning summary:`;

  return await callGroq(system, user, 1800);
}

// Main function — called by server.js
// source: 'video' | 'document'
export async function summarizeTranscript(transcript, source = 'video') {

  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is missing from .env file');

  console.log(`Transcript length: ${transcript.length} characters`);

  const chunks = splitIntoChunks(transcript, 3000);
  console.log(`Split into ${chunks.length} chunks`);

  console.log('Summarizing all chunks in parallel...');
  const chunkSummaries = await Promise.all(
    chunks.map((chunk, i) => summarizeChunk(chunk, i, chunks.length, source))
  );

  const mergedNotes = await combineNotes(chunkSummaries, source);
  const finalSummary = await generateFinalSummary(mergedNotes, source);

  return finalSummary;
}