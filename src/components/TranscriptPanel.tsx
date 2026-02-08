"use client";

import { useEffect, useRef } from "react";

interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function TranscriptPanel({ segments }: { segments: TranscriptSegment[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [segments]);

  return (
    <div className="w-1/2 border-r border-dark-border flex flex-col bg-dark-panel">
      <div className="px-4 py-3 border-b border-dark-border flex-shrink-0">
        <h2 className="text-sm font-semibold text-dark-muted uppercase tracking-wider">
          📝 Live Transcript
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {segments.length === 0 ? (
          <div className="flex items-center justify-center h-full text-dark-muted text-sm">
            <div className="text-center">
              <p className="text-3xl mb-3">🎙️</p>
              <p>No transcript yet.</p>
              <p className="text-xs mt-1">Start recording to see live transcription.</p>
            </div>
          </div>
        ) : (
          segments.map((seg) => (
            <div key={seg.id} className="group flex gap-3 hover:bg-dark-bg/50 rounded px-2 py-1.5 -mx-2 transition-colors">
              <span className="text-xs text-dark-accent font-mono mt-0.5 flex-shrink-0 w-12">
                {formatTime(seg.timestamp)}
              </span>
              <p className="text-sm leading-relaxed">{seg.text}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
