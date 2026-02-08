import { store, TranscriptSegment, NoteChunk, ChatMessage } from "@/lib/store";

describe("Store", () => {
  beforeEach(() => {
    // Clear all sessions
    for (const id of Array.from(store.sessions.keys())) {
      store.deleteSession(id);
    }
  });

  test("createSession creates and stores a session", () => {
    const s = store.createSession("s1", "Lecture 1", "CS101");
    expect(s.id).toBe("s1");
    expect(s.name).toBe("Lecture 1");
    expect(s.className).toBe("CS101");
    expect(s.isRecording).toBe(false);
    expect(s.transcriptSegments).toEqual([]);
    expect(s.noteChunks).toEqual([]);
    expect(s.chatMessages).toEqual([]);
  });

  test("getSession returns session or undefined", () => {
    store.createSession("s1", "Test", "Class");
    expect(store.getSession("s1")).toBeDefined();
    expect(store.getSession("nonexistent")).toBeUndefined();
  });

  test("getAllSessions returns sorted by createdAt desc", () => {
    const s1 = store.createSession("s1", "First", "A");
    const s2 = store.createSession("s2", "Second", "B");
    // Manually set createdAt to ensure order
    s1.createdAt = 1000;
    s2.createdAt = 2000;
    const all = store.getAllSessions();
    expect(all[0].id).toBe("s2");
    expect(all[1].id).toBe("s1");
  });

  test("addTranscript adds segment to session", () => {
    store.createSession("s1", "Test", "Class");
    const seg: TranscriptSegment = {
      id: "t1", sessionId: "s1", text: "Hello", timestamp: 0, createdAt: Date.now(),
    };
    store.addTranscript("s1", seg);
    expect(store.getSession("s1")!.transcriptSegments).toHaveLength(1);
    expect(store.getSession("s1")!.transcriptSegments[0].text).toBe("Hello");
  });

  test("addTranscript does nothing for nonexistent session", () => {
    const seg: TranscriptSegment = {
      id: "t1", sessionId: "nope", text: "Hello", timestamp: 0, createdAt: Date.now(),
    };
    expect(() => store.addTranscript("nope", seg)).not.toThrow();
  });

  test("addNoteChunks adds chunks to session", () => {
    store.createSession("s1", "Test", "Class");
    const chunks: NoteChunk[] = [
      { id: "c1", sessionId: "s1", filename: "notes.txt", text: "chunk1", embedding: [1, 2], chunkIndex: 0 },
      { id: "c2", sessionId: "s1", filename: "notes.txt", text: "chunk2", embedding: [3, 4], chunkIndex: 1 },
    ];
    store.addNoteChunks("s1", chunks);
    expect(store.getSession("s1")!.noteChunks).toHaveLength(2);
  });

  test("addChatMessage adds message to session", () => {
    store.createSession("s1", "Test", "Class");
    const msg: ChatMessage = {
      id: "m1", sessionId: "s1", role: "user", content: "Hi", createdAt: Date.now(),
    };
    store.addChatMessage("s1", msg);
    expect(store.getSession("s1")!.chatMessages).toHaveLength(1);
  });

  test("deleteSession removes session", () => {
    store.createSession("s1", "Test", "Class");
    store.deleteSession("s1");
    expect(store.getSession("s1")).toBeUndefined();
  });
});
