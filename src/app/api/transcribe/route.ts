import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { store, TranscriptSegment } from "@/lib/store";
import { embedText } from "@/lib/embeddings";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as File;
    const sessionId = formData.get("sessionId") as string;
    const timestamp = parseFloat(formData.get("timestamp") as string) || 0;

    if (!audio || !sessionId) {
      return NextResponse.json({ error: "Missing audio or sessionId" }, { status: 400 });
    }

    const session = store.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
      response_format: "text",
    });

    const text = (transcription as unknown as string).trim();
    if (!text) {
      return NextResponse.json({ text: "", id: null });
    }

    const embedding = await embedText(text);

    const segment: TranscriptSegment = {
      id: uuidv4(),
      sessionId,
      text,
      timestamp,
      createdAt: Date.now(),
      embedding,
    };

    store.addTranscript(sessionId, segment);

    return NextResponse.json({
      id: segment.id,
      text: segment.text,
      timestamp: segment.timestamp,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    console.error("Transcribe error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
