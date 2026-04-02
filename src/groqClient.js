import 'dotenv/config';

const GROQ_TIMEOUT_MS = 30_000;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function groqFetch(body, apiKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json();
    if (data.error) throw new Error(`Groq error: ${data.error.message}`);
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('TIMEOUT');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}