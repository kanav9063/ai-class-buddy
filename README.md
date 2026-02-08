# AI Class Buddy 🎓

Real-time lecture companion with live transcription and AI-powered Q&A.

## Features

- **Live Transcription** — Capture mic or tab audio, transcribed in real-time via OpenAI Whisper
- **Lecture Notes Upload** — Upload PDF, text, or markdown files; automatically chunked and embedded
- **RAG Q&A Chat** — Ask questions about the lecture; searches both live transcript and notes using semantic similarity
- **Session Management** — Create sessions per class, switch between them

## Setup

```bash
cp .env.example .env
# Add your OpenAI API key to .env

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Create a new session (click **+ New**, enter name and class)
2. Upload lecture notes (PDF/txt/md) via **Upload Notes**
3. Click **🎤 Mic** or **🔊 Tab Audio** to start recording
4. Watch the live transcript appear in the left panel
5. Ask questions in the right panel chat — the AI searches your transcript and notes to answer

## Tech Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- OpenAI Whisper API (transcription)
- OpenAI text-embedding-3-small (embeddings)
- OpenAI GPT-4o-mini (chat)
- In-memory vector store with cosine similarity
