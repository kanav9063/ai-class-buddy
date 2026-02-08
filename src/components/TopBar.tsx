"use client";

import { useState, useRef } from "react";

interface SessionInfo {
  id: string;
  name: string;
  className: string;
}

interface TopBarProps {
  sessions: SessionInfo[];
  currentSessionId: string | null;
  isRecording: boolean;
  noteFiles: string[];
  onSelectSession: (id: string) => void;
  onCreateSession: (name: string, className: string) => void;
  onStartRecording: (source: "mic" | "tab") => void;
  onStopRecording: () => void;
  onUploadFile: (file: File) => Promise<unknown>;
}

export default function TopBar({
  sessions,
  currentSessionId,
  isRecording,
  noteFiles,
  onSelectSession,
  onCreateSession,
  onStartRecording,
  onStopRecording,
  onUploadFile,
}: TopBarProps) {
  const [showNewSession, setShowNewSession] = useState(false);
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateSession(newName.trim(), newClass.trim() || "General");
      setNewName("");
      setNewClass("");
      setShowNewSession(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUploadFile(file);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="bg-dark-panel border-b border-dark-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <span className="text-xl">🎓</span>
        <span className="font-bold text-lg hidden sm:inline">Class Buddy</span>
      </div>

      {/* Session selector */}
      <select
        className="bg-dark-bg border border-dark-border rounded px-3 py-1.5 text-sm max-w-[200px] focus:outline-none focus:border-dark-accent"
        value={currentSessionId || ""}
        onChange={(e) => e.target.value && onSelectSession(e.target.value)}
      >
        <option value="">Select session...</option>
        {sessions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.className}: {s.name}
          </option>
        ))}
      </select>

      <button
        onClick={() => setShowNewSession(!showNewSession)}
        className="bg-dark-accent hover:bg-dark-accent-hover text-white text-sm px-3 py-1.5 rounded transition-colors"
      >
        + New
      </button>

      {showNewSession && (
        <div className="flex items-center gap-2">
          <input
            className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm w-32 focus:outline-none focus:border-dark-accent"
            placeholder="Session name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <input
            className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm w-28 focus:outline-none focus:border-dark-accent"
            placeholder="Class"
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button
            onClick={handleCreate}
            className="text-sm text-dark-accent hover:text-dark-accent-hover"
          >
            Create
          </button>
        </div>
      )}

      <div className="flex-1" />

      {/* Note files indicator */}
      {noteFiles.length > 0 && (
        <span className="text-xs text-dark-muted hidden md:inline">
          📎 {noteFiles.length} note{noteFiles.length > 1 ? "s" : ""}
        </span>
      )}

      {/* Upload */}
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.txt,.md,.markdown"
        className="hidden"
        onChange={handleUpload}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={!currentSessionId || uploading}
        className="bg-dark-bg border border-dark-border text-sm px-3 py-1.5 rounded hover:border-dark-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? "Uploading..." : "📄 Upload Notes"}
      </button>

      {/* Recording controls */}
      {!isRecording ? (
        <div className="flex gap-1">
          <button
            onClick={() => onStartRecording("mic")}
            disabled={!currentSessionId}
            className="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1.5 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            🎤 Mic
          </button>
          <button
            onClick={() => onStartRecording("tab")}
            disabled={!currentSessionId}
            className="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1.5 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            🔊 Tab Audio
          </button>
        </div>
      ) : (
        <button
          onClick={onStopRecording}
          className="bg-dark-bg border border-red-500 text-red-400 text-sm px-3 py-1.5 rounded hover:bg-red-500/10 transition-colors flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-red-500 rounded-full recording-pulse" />
          Stop Recording
        </button>
      )}
    </div>
  );
}
