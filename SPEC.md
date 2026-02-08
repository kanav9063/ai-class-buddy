# AI Class Buddy — Spec

## Overview
A real-time lecture companion that runs locally on a laptop. It captures live audio from lectures, transcribes in real-time, and combines that transcript with pre-loaded lecture notes/slides to answer questions about what's being taught — right now.

## Core Features

### 1. Real-Time Transcription
- Captures system audio (lecture stream) or microphone
- Uses Whisper (local via whisper.cpp or faster-whisper) for low-latency transcription
- Rolling transcript displayed in the UI
- Segments stored with timestamps

### 2. Lecture Notes Integration
- Upload PDF/markdown/text lecture notes before class
- Notes are chunked and embedded for retrieval
- Combined context: lecture notes + live transcript

### 3. Contextual Q&A
- Chat interface to ask questions like "what did he just say about the loss curve?"
- Uses RAG: retrieves relevant chunks from both transcript and notes
- LLM generates answer grounded in lecture context
- Supports OpenAI API or local models

### 4. Session Management
- Start/stop recording sessions per class
- Save transcripts for later review
- Export transcript + Q&A history

## Tech Stack
- **Frontend:** Next.js (React) with Tailwind CSS
- **Audio Capture:** Web Audio API (browser-based capture)
- **Transcription:** OpenAI Whisper API (cloud) with option for local whisper
- **Embeddings:** OpenAI text-embedding-3-small
- **Vector Store:** In-memory (chromadb or just cosine similarity on embeddings)
- **LLM:** OpenAI GPT-4o-mini (default), configurable
- **Storage:** Local SQLite via better-sqlite3

## UI
- Left panel: rolling live transcript with timestamps
- Right panel: chat Q&A
- Top bar: session controls (start/stop recording, upload notes, select class)
- Clean, minimal, dark mode

## Setup
- `npm install && npm run dev`
- Set OPENAI_API_KEY in .env
- Open browser, select audio source, start session
