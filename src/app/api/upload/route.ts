import { NextRequest, NextResponse } from "next/server";
import { store, NoteChunk } from "@/lib/store";
import { chunkText, embedTexts } from "@/lib/embeddings";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const sessionId = formData.get("sessionId") as string;

    if (!file || !sessionId) {
      return NextResponse.json({ error: "Missing file or sessionId" }, { status: 400 });
    }

    const session = store.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    let text: string;
    const filename = file.name.toLowerCase();

    if (filename.endsWith(".pdf")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfParse = (await import("pdf-parse")).default;
      const pdf = await pdfParse(buffer);
      text = pdf.text;
    } else {
      text = await file.text();
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "File appears empty" }, { status: 400 });
    }

    const chunks = chunkText(text, 400, 50);
    const embeddings = await embedTexts(chunks);

    const noteChunks: NoteChunk[] = chunks.map((chunk, i) => ({
      id: uuidv4(),
      sessionId,
      filename: file.name,
      text: chunk,
      embedding: embeddings[i],
      chunkIndex: i,
    }));

    store.addNoteChunks(sessionId, noteChunks);

    return NextResponse.json({
      filename: file.name,
      chunks: noteChunks.length,
      message: `Uploaded and indexed ${noteChunks.length} chunks from ${file.name}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("Upload error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
