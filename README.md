# Ascend — YT Summarizer

A full-stack web application that takes any YouTube video URL, fetches its transcript, and generates a structured AI learning summary with a built-in chatbot to ask follow-up questions about the video content.

---

## Tech Stack

**Frontend** — React 18 with Vite as the build tool, Tailwind CSS v3 for styling, Plus Jakarta Sans from Google Fonts. Runs on port 5173 in development.

**Backend** — Node.js v24 with ES Modules (`"type": "module"`), Express.js for the HTTP server, Nodemon for auto-restart in development. Runs on port 3001.

**AI** — Groq API using `llama-3.3-70b-versatile`. Used for both transcript summarization and chat responses. API format is OpenAI-compatible. Free tier has a 100k token/day limit.

**Transcript** — Supadata API, a third-party REST service that fetches YouTube video transcripts. Returns an array of segments which are joined into a single string.

**Video Metadata** — YouTube oEmbed endpoint to fetch video titles. Free, no API key required.

---

## Project Structure

```
yt_vid/
├── server.js                  ← Express server, two API endpoints
├── vercel.json                ← Vercel deployment configuration
├── .env                       ← API keys (never commit)
├── package.json               ← type: module, nodemon dev script
├── src/
│   ├── parser.js              ← Extracts video ID from any YouTube URL format
│   ├── transcript.js          ← Fetches transcript via Supadata API
│   └── summarizer.js          ← Map-reduce summarization pipeline via Groq
└── frontend/
    ├── src/
    │   ├── App.jsx            ← Main layout, resizable panels, state management
    │   ├── VideoPanel.jsx     ← YouTube iframe embed component
    │   ├── SummaryPanel.jsx   ← Parses and renders structured summary as bento grid
    │   └── ChatBox.jsx        ← Chat interface with markdown rendering
    ├── tailwind.config.js     ← Custom color tokens
    ├── vite.config.js
    └── index.css              ← Tailwind directives + custom scrollbar
```

---

## API Endpoints

**POST /api/summarize**
Receives `{ url }`. Extracts video ID, fetches title via oEmbed, fetches transcript via Supadata, runs the summarization pipeline, returns `{ summary, videoId, videoTitle }`.

**POST /api/chat**
Receives `{ question, summary, history }`. Builds a message array with the full summary as system context plus conversation history, calls Groq, returns `{ answer }`.

---

## Summarization Pipeline

The summarizer in `src/summarizer.js` uses a three-step map-reduce approach.

Step 1 — the transcript is split at sentence boundaries (`.` `!` `?`) into chunks of roughly 3000 characters so words are never cut mid-sentence.

Step 2 — all chunks are sent to Groq simultaneously via `Promise.all()`. Each chunk gets a focused extraction prompt to pull out facts, concepts, and data points while skipping filler.

Step 3 — all chunk summaries are combined into one unified set of notes via a second Groq call, then a final prompt generates the structured output in this fixed format:

```
## 🎯 What This Video Is About
## 📊 Key Metric
## 💬 Key Quote
## 🧠 Core Concepts Explained
## 💡 Key Insights & Takeaways
## ✅ What You Can Do With This
## 🔍 Questions To Think About
```

---

## Environment Variables

Create a `.env` file in the project root:

```
SUPADATA_API_KEY=your_supadata_key
GROQ_API_KEY=your_groq_key
PORT=3001
```

Both keys have free tiers. Groq at console.groq.com, Supadata at supadata.ai.

---

## Running Locally

Install backend dependencies from the root:
```bash
npm install
```

Install frontend dependencies:
```bash
cd frontend && npm install
```

Run the backend (Terminal 1):
```bash
npm run dev
```

Run the frontend (Terminal 2):
```bash
cd frontend && npm run dev
```

The app will be available at `http://localhost:5173`. The frontend proxies API calls to the backend at port 3001.

---

## Deployment

The project is configured for Vercel via `vercel.json` in the root. The backend deploys as a serverless Node function and the frontend builds as a static site. Both live under the same domain so `/api/*` routes hit the backend and everything else serves the frontend.

Add these environment variables in the Vercel project dashboard before deploying:
- `SUPADATA_API_KEY`
- `GROQ_API_KEY`

Build command: `cd frontend && npm install && npm run build`
Output directory: `frontend/dist`

---

## Known Limitations

Videos without captions such as music videos or some non-English content will fail since there is no transcript to fetch. Groq's free tier caps at 100k tokens per day — very long videos with many chunks can approach this quickly. Supadata's free tier has monthly request limits. There is currently no persistent storage so summaries are lost on page refresh, and no user authentication.
