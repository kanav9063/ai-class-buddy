import { store } from "@/lib/store";
import { NextRequest } from "next/server";

// Mock OpenAI
jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: "AI response about the lecture" } }],
        }),
      },
    },
  }));
});

// Mock embeddings
jest.mock("@/lib/embeddings", () => ({
  embedText: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
  searchSimilar: jest.fn().mockReturnValue([
    { text: "relevant context", score: 0.9, source: "notes" },
  ]),
}));

jest.mock("uuid", () => ({ v4: jest.fn(() => "chat-uuid") }));

// Import after mocks
import { POST } from "@/app/api/chat/route";

describe("Chat API", () => {
  beforeEach(() => {
    for (const id of Array.from(store.sessions.keys())) {
      store.deleteSession(id);
    }
  });

  test("processes a chat message and returns AI response", async () => {
    store.createSession("s1", "Test", "Class");
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ sessionId: "s1", message: "What is this about?" }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.role).toBe("assistant");
    expect(data.content).toBe("AI response about the lecture");
    expect(data.id).toBe("chat-uuid");
    // Check messages were stored
    const session = store.getSession("s1")!;
    expect(session.chatMessages).toHaveLength(2); // user + assistant
    expect(session.chatMessages[0].role).toBe("user");
    expect(session.chatMessages[1].role).toBe("assistant");
  });

  test("returns 400 if sessionId missing", async () => {
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "hi" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 400 if message missing", async () => {
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ sessionId: "s1" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("returns 404 if session not found", async () => {
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ sessionId: "nope", message: "hi" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });
});
