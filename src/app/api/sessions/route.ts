import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const sessions = store.getAllSessions().map((s) => ({
    id: s.id,
    name: s.name,
    className: s.className,
    createdAt: s.createdAt,
    isRecording: s.isRecording,
    transcriptCount: s.transcriptSegments.length,
    noteChunkCount: s.noteChunks.length,
  }));
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const { name, className } = await req.json();
  const session = store.createSession(uuidv4(), name || "Untitled Session", className || "General");
  return NextResponse.json({ id: session.id, name: session.name, className: session.className });
}
