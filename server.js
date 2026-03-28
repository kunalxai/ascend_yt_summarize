import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { extractVideoId } from './src/parser.js';
import { getTranscript } from './src/transcript.js';
import { summarizeTranscript } from './src/summarizer.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoint 1 — summarize a YouTube video
app.post('/api/summarize', async (req, res) => {

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  try {
    // Step 1 — extract video ID
    const videoId = extractVideoId(url);
    console.log(`Video ID extracted: ${videoId}`);

    // Step 2 — fetch video title from YouTube oEmbed (free, no API key needed)
    let videoTitle = 'Video Summary';
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      const oembedData = await oembedRes.json();
      videoTitle = oembedData.title || 'Video Summary';
    } catch {
      console.log('Could not fetch video title, using default');
    }

    // Step 3 — fetch transcript
    const transcript = await getTranscript(videoId);
    console.log(`Transcript fetched — ${transcript.length} characters`);

    // Step 4 — summarize
    const summary = await summarizeTranscript(transcript);
    console.log(`Summary generated successfully`);

    // Step 5 — send everything back to frontend
    res.json({ summary, videoId, videoTitle });

  } catch (error) {
    console.error('Error:', error.message);

    if (error.message === 'Invalid YouTube URL') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('No transcript')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Endpoint 2 — chat about the video summary
app.post('/api/chat', async (req, res) => {

  const { question, summary, history } = req.body;

  if (!question || !summary) {
    return res.status(400).json({ error: 'Question and summary are required' });
  }

  try {
    const messages = [
      {
        role: 'system',
        content: `You are an intelligent tutor helping a user understand a YouTube video they just watched. You have access to the full summary of the video.

Your rules:
- Only answer questions based on what the video covers — don't add outside knowledge
- Be clear, engaging and educational in your responses
- If the user asks something not covered in the video, politely say so
- Use simple language and examples where helpful
- Keep responses focused and concise — 3-5 sentences unless more detail is needed

Video Summary:
${summary}`
      },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: question
      }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 600,
        temperature: 0.5
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    res.json({ answer: data.choices[0].message.content.trim() });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Chat failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});