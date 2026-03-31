import express from 'express';
import cors from 'cors';
import multer from 'multer';
import 'dotenv/config';
import { extractVideoId } from './src/parser.js';
import { getTranscript } from './src/transcript.js';
import { summarizeTranscript } from './src/summarizer.js';
import { extractTextFromFile } from './src/extractor.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Multer — store file in memory, 20MB limit, PDF and DOCX only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are supported'));
    }
  }
});

// Endpoint 1 — summarize a YouTube video
app.post('/api/summarize', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  try {
    const videoId = extractVideoId(url);
    console.log(`Video ID extracted: ${videoId}`);

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

    const transcript = await getTranscript(videoId);
    console.log(`Transcript fetched — ${transcript.length} characters`);

    const summary = await summarizeTranscript(transcript, 'video');
    console.log('Summary generated successfully');

    res.json({ summary, videoId, videoTitle });

  } catch (error) {
    console.error('Error:', error.message);
    if (error.message === 'Invalid YouTube URL') return res.status(400).json({ error: error.message });
    if (error.message.includes('No transcript')) return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Endpoint 2 — summarize an uploaded PDF or Word document
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    console.log(`File received: ${req.file.originalname} (${req.file.mimetype})`);

    // Step 1 — extract text from file buffer
    const text = await extractTextFromFile(req.file.buffer, req.file.mimetype);

    // Step 2 — run through the exact same summarization pipeline
    const summary = await summarizeTranscript(text, 'document');
    console.log('Document summary generated successfully');

    res.json({
      summary,
      fileName: req.file.originalname
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    if (error.message.includes('Unsupported file type')) return res.status(400).json({ error: error.message });
    if (error.message.includes('Could not extract text')) return res.status(422).json({ error: error.message });
    res.status(500).json({ error: 'Something went wrong processing your document' });
  }
});

// Endpoint 3 — chat about the summary (works for both video and document)
app.post('/api/chat', async (req, res) => {
  const { question, summary, history } = req.body;
  if (!question || !summary) return res.status(400).json({ error: 'Question and summary are required' });

  try {
    const messages = [
      {
        role: 'system',
        content: `You are an intelligent tutor helping a user understand content they just had summarized. You have access to the full summary.

Your rules:
- Only answer questions based on what the content covers — don't add outside knowledge
- Be clear, engaging and educational in your responses
- If the user asks something not covered in the content, politely say so
- Use simple language and examples where helpful
- Keep responses focused and concise — 3-5 sentences unless more detail is needed

Summary:
${summary}`
      },
      ...history.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: question }
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
    if (data.error) throw new Error(data.error.message);

    res.json({ answer: data.choices[0].message.content.trim() });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Chat failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});