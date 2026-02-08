import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = store.getSession(params.id);
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: session.id,
    name: session.name,
    className: session.className,
    createdAt: session.createdAt,
    isRecording: session.isRecording,
    transcriptSegments: session.transcriptSegments.map((s) => ({
      id: s.id,
      text: s.text,
      timestamp: s.timestamp,
    })),
    chatMessages: session.chatMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
    noteFiles: [...new Set(session.noteChunks.map((c) => c.filename))],
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  store.deleteSession(params.id);
  return NextResponse.json({ ok: true });
}
