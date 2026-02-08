import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { store, ChatMessage } from "@/lib/store";
import { embedText, searchSimilar } from "@/lib/embeddings";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message } = await req.json();
    if (!sessionId || !message) {
      return NextResponse.json({ error: "Missing sessionId or message" }, { status: 400 });
    }

    const session = store.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Save user message
    const userMsg: ChatMessage = {
      id: uuidv4(),
      sessionId,
      role: "user",
      content: message,
      createdAt: Date.now(),
    };
    store.addChatMessage(sessionId, userMsg);

    // Embed query and search
    const queryEmbedding = await embedText(message);

    const searchItems = [
      ...session.transcriptSegments
        .filter((s) => s.embedding)
        .map((s) => ({
          text: `[${formatTime(s.timestamp)}] ${s.text}`,
          embedding: s.embedding!,
          source: "transcript" as const,
        })),
      ...session.noteChunks.map((c) => ({
        text: c.text,
        embedding: c.embedding,
        source: "notes" as const,
      })),
    ];

    const results = searchSimilar(queryEmbedding, searchItems, 6);

    const contextParts = results.map(
      (r) => `[${r.source.toUpperCase()}] ${r.text}`
    );
    const context = contextParts.join("\n\n---\n\n");

    // Build conversation history (last 10 messages for context)
    const recentMessages = session.chatMessages.slice(-10).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI study assistant helping a student during a live lecture. You have access to the live transcript and uploaded lecture notes. Answer questions based on this context. Be concise and helpful. If the context doesn't contain enough information, say so.

CONTEXT:
${context}`,
        },
        ...recentMessages,
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    const assistantMsg: ChatMessage = {
      id: uuidv4(),
      sessionId,
      role: "assistant",
      content: reply,
      createdAt: Date.now(),
    };
    store.addChatMessage(sessionId, assistantMsg);

    return NextResponse.json({
      id: assistantMsg.id,
      role: "assistant",
      content: reply,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat failed";
    console.error("Chat error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
