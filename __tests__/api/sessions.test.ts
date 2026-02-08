import { GET, POST } from "@/app/api/sessions/route";
import { GET as GET_BY_ID, DELETE } from "@/app/api/sessions/[id]/route";
import { store } from "@/lib/store";
import { NextRequest } from "next/server";

// Mock uuid
jest.mock("uuid", () => ({ v4: () => "test-uuid-123" }));

describe("Sessions API", () => {
  beforeEach(() => {
    for (const id of Array.from(store.sessions.keys())) {
      store.deleteSession(id);
    }
  });

  describe("POST /api/sessions", () => {
    test("creates a session with name and className", async () => {
      const req = new NextRequest("http://localhost/api/sessions", {
        method: "POST",
        body: JSON.stringify({ name: "Lecture 1", className: "CS101" }),
      });
      const res = await POST(req);
      const data = await res.json();
      expect(data.id).toBe("test-uuid-123");
      expect(data.name).toBe("Lecture 1");
      expect(data.className).toBe("CS101");
    });

    test("uses defaults for missing fields", async () => {
      const req = new NextRequest("http://localhost/api/sessions", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const res = await POST(req);
      const data = await res.json();
      expect(data.name).toBe("Untitled Session");
      expect(data.className).toBe("General");
    });
  });

  describe("GET /api/sessions", () => {
    test("lists all sessions", async () => {
      store.createSession("s1", "A", "X");
      store.createSession("s2", "B", "Y");
      const res = await GET();
      const data = await res.json();
      expect(data).toHaveLength(2);
      expect(data[0]).toHaveProperty("id");
      expect(data[0]).toHaveProperty("transcriptCount");
      expect(data[0]).toHaveProperty("noteChunkCount");
    });

    test("returns empty array when no sessions", async () => {
      const res = await GET();
      const data = await res.json();
      expect(data).toEqual([]);
    });
  });

  describe("GET /api/sessions/[id]", () => {
    test("returns session details", async () => {
      store.createSession("s1", "Lecture", "CS");
      const req = new NextRequest("http://localhost/api/sessions/s1");
      const res = await GET_BY_ID(req, { params: { id: "s1" } });
      const data = await res.json();
      expect(data.id).toBe("s1");
      expect(data.name).toBe("Lecture");
      expect(data.transcriptSegments).toEqual([]);
      expect(data.chatMessages).toEqual([]);
      expect(data.noteFiles).toEqual([]);
    });

    test("returns 404 for nonexistent session", async () => {
      const req = new NextRequest("http://localhost/api/sessions/nope");
      const res = await GET_BY_ID(req, { params: { id: "nope" } });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/sessions/[id]", () => {
    test("deletes a session", async () => {
      store.createSession("s1", "Test", "Class");
      const req = new NextRequest("http://localhost/api/sessions/s1", { method: "DELETE" });
      const res = await DELETE(req, { params: { id: "s1" } });
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(store.getSession("s1")).toBeUndefined();
    });
  });
});
