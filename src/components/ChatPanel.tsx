"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  sessionId: string | null;
}

export default function ChatPanel({ messages, onSendMessage, sessionId }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    try {
      await onSendMessage(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-1/2 flex flex-col bg-dark-bg">
      <div className="px-4 py-3 border-b border-dark-border flex-shrink-0">
        <h2 className="text-sm font-semibold text-dark-muted uppercase tracking-wider">
          💬 Q&A Chat
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-dark-muted text-sm">
            <div className="text-center">
              <p className="text-3xl mb-3">🤖</p>
              <p>Ask questions about the lecture.</p>
              <p className="text-xs mt-1">
                I&apos;ll search the transcript and your notes to answer.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-dark-accent text-white"
                    : "bg-dark-panel border border-dark-border"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-dark-panel border border-dark-border rounded-lg px-4 py-2.5 text-sm text-dark-muted">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-dark-border flex-shrink-0">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-dark-panel border border-dark-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-dark-accent placeholder:text-dark-muted disabled:opacity-40"
            placeholder={sessionId ? "Ask about the lecture..." : "Select a session first"}
            value={input}
            disabled={!sessionId || sending}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!sessionId || !input.trim() || sending}
            className="bg-dark-accent hover:bg-dark-accent-hover text-white px-4 py-2.5 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
