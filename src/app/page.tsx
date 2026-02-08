"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TopBar from "@/components/TopBar";
import TranscriptPanel from "@/components/TranscriptPanel";
import ChatPanel from "@/components/ChatPanel";

interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface SessionInfo {
  id: string;
  name: string;
  className: string;
}

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [noteFiles, setNoteFiles] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load sessions on mount
  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then(setSessions)
      .catch(console.error);
  }, []);

  // Load session data when selected
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setTranscripts(data.transcriptSegments || []);
        setChatMessages(data.chatMessages || []);
        setNoteFiles(data.noteFiles || []);
      })
      .catch(console.error);
  }, [sessionId]);

  const createSession = async (name: string, className: string) => {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, className }),
    });
    const session = await res.json();
    setSessions((prev) => [session, ...prev]);
    setSessionId(session.id);
    setTranscripts([]);
    setChatMessages([]);
    setNoteFiles([]);
  };

  const sendChunk = useCallback(
    async (blob: Blob) => {
      if (!sessionId || blob.size < 1000) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const formData = new FormData();
      formData.append("audio", blob, "chunk.webm");
      formData.append("sessionId", sessionId);
      formData.append("timestamp", elapsed.toString());

      try {
        const res = await fetch("/api/transcribe", { method: "POST", body: formData });
        const data = await res.json();
        if (data.text && data.id) {
          setTranscripts((prev) => [
            ...prev,
            { id: data.id, text: data.text, timestamp: data.timestamp },
          ]);
        }
      } catch (err) {
        console.error("Transcription error:", err);
      }
    },
    [sessionId]
  );

  const startRecording = async (source: "mic" | "tab") => {
    if (!sessionId) return;
    try {
      let stream: MediaStream;
      if (source === "tab") {
        stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: false });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      streamRef.current = stream;
      startTimeRef.current = Date.now();

      // Record in 5-second chunks
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) sendChunk(e.data);
      };

      recorder.start();
      setIsRecording(true);

      // Every 5 seconds, stop and restart to get chunks
      intervalRef.current = setInterval(() => {
        if (recorder.state === "recording") {
          recorder.stop();
          setTimeout(() => {
            if (streamRef.current?.active) {
              const newRecorder = new MediaRecorder(streamRef.current, {
                mimeType: "audio/webm;codecs=opus",
              });
              newRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) sendChunk(e.data);
              };
              newRecorder.start();
              mediaRecorderRef.current = newRecorder;
            }
          }, 100);
        }
      }, 5000);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  const uploadFile = async (file: File) => {
    if (!sessionId) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.filename) {
      setNoteFiles((prev) => [...new Set([...prev, data.filename])]);
    }
    return data;
  };

  const sendMessage = async (message: string) => {
    if (!sessionId) return;
    const tempId = `temp-${Date.now()}`;
    setChatMessages((prev) => [
      ...prev,
      { id: tempId, role: "user", content: message },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message }),
      });
      const data = await res.json();
      if (data.content) {
        setChatMessages((prev) => [
          ...prev,
          { id: data.id, role: "assistant", content: data.content },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "assistant", content: "Error getting response." },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        sessions={sessions}
        currentSessionId={sessionId}
        isRecording={isRecording}
        noteFiles={noteFiles}
        onSelectSession={setSessionId}
        onCreateSession={createSession}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onUploadFile={uploadFile}
      />
      <div className="flex flex-1 overflow-hidden">
        <TranscriptPanel segments={transcripts} />
        <ChatPanel messages={chatMessages} onSendMessage={sendMessage} sessionId={sessionId} />
      </div>
    </div>
  );
}
