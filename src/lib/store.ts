export interface TranscriptSegment {
  id: string;
  sessionId: string;
  text: string;
  timestamp: number; // seconds from session start
  createdAt: number;
  embedding?: number[];
}

export interface NoteChunk {
  id: string;
  sessionId: string;
  filename: string;
  text: string;
  embedding: number[];
  chunkIndex: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface Session {
  id: string;
  name: string;
  className: string;
  createdAt: number;
  isRecording: boolean;
  transcriptSegments: TranscriptSegment[];
  noteChunks: NoteChunk[];
  chatMessages: ChatMessage[];
}

class Store {
  sessions: Map<string, Session> = new Map();

  createSession(id: string, name: string, className: string): Session {
    const session: Session = {
      id,
      name,
      className,
      createdAt: Date.now(),
      isRecording: false,
      transcriptSegments: [],
      noteChunks: [],
      chatMessages: [],
    };
    this.sessions.set(id, session);
    return session;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  }

  addTranscript(sessionId: string, segment: TranscriptSegment) {
    const session = this.sessions.get(sessionId);
    if (session) session.transcriptSegments.push(segment);
  }

  addNoteChunks(sessionId: string, chunks: NoteChunk[]) {
    const session = this.sessions.get(sessionId);
    if (session) session.noteChunks.push(...chunks);
  }

  addChatMessage(sessionId: string, msg: ChatMessage) {
    const session = this.sessions.get(sessionId);
    if (session) session.chatMessages.push(msg);
  }

  deleteSession(id: string) {
    this.sessions.delete(id);
  }
}

// Singleton
const globalStore = globalThis as unknown as { __store?: Store };
if (!globalStore.__store) globalStore.__store = new Store();
export const store: Store = globalStore.__store;
