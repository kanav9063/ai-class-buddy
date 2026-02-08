import { POST } from "@/app/api/upload/route";
import { store } from "@/lib/store";
import { NextRequest } from "next/server";

// Mock embeddings
jest.mock("@/lib/embeddings", () => ({
  chunkText: jest.fn((text: string, size: number) => {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += size) {
      const chunk = words.slice(i, i + size).join(" ");
      if (chunk.trim()) chunks.push(chunk.trim());
    }
    return chunks.length > 0 ? chunks : ["single chunk"];
  }),
  embedTexts: jest.fn((texts: string[]) =>
    Promise.resolve(texts.map((_, i) => [i, i + 1, i + 2]))
  ),
}));

jest.mock("uuid", () => ({ v4: jest.fn(() => "chunk-uuid") }));

describe("Upload API", () => {
  beforeEach(() => {
    for (const id of Array.from(store.sessions.keys())) {
      store.deleteSession(id);
    }
  });

  test("uploads and chunks a text file", async () => {
    store.createSession("s1", "Test", "Class");
    const content = Array.from({ length: 500 }, (_, i) => `word${i}`).join(" ");
    const file = new File([content], "notes.txt", { type: "text/plain" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", "s1");

    const req = new NextRequest("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.filename).toBe("notes.txt");
    expect(data.chunks).toBeGreaterThan(0);
    expect(store.getSession("s1")!.noteChunks.length).toBeGreaterThan(0);
  });

  test("returns 400 if file missing", async () => {
    const formData = new FormData();
    formData.append("sessionId", "s1");
    const req = new NextRequest("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 if sessionId missing", async () => {
    const file = new File(["content"], "notes.txt");
    const formData = new FormData();
    formData.append("file", file);
    const req = new NextRequest("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 404 if session not found", async () => {
    const file = new File(["content"], "notes.txt");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", "nonexistent");
    const req = new NextRequest("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  test("returns 400 for empty file", async () => {
    store.createSession("s1", "Test", "Class");
    const file = new File(["   "], "empty.txt");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", "s1");
    const req = new NextRequest("http://localhost/api/upload", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
