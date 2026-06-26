"use client";

import { useState } from "react";
import { MessageCircle, Send, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { TranscriptSegment } from "@/types/meeting";
import { formatTimestamp } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: TranscriptSegment[];
}

export function AskMeetingChat({ meetingId }: { meetingId: number }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);
    try {
      const res = await api.askQuestion(meetingId, question);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.answer,
          sources: res.source_segments,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I couldn't pull a precise answer from this meeting right now. Try rephrasing or ask about a specific topic discussed in the transcript.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-brand/90"
      >
        <MessageCircle className="h-4 w-4" />
        Ask about this meeting
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 flex h-[420px] w-96 flex-col rounded-2xl border border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-brand" />
          Ask MeetMind
        </div>
        <button onClick={() => setOpen(false)} className="text-xs text-muted hover:text-foreground">
          Close
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted">
            Ask anything about this meeting — decisions, action items, who said what...
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg p-3 text-sm ${
              msg.role === "user" ? "ml-8 bg-brand text-white" : "mr-4 bg-background"
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 space-y-1 border-t border-border/50 pt-2">
                {msg.sources.map((s) => (
                  <p key={s.id} className="text-[10px] opacity-80">
                    {formatTimestamp(s.start_ms)} — {s.speaker}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <p className="text-center text-xs text-muted">Thinking...</p>}
      </div>

      <form onSubmit={handleAsk} className="flex gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What was decided about..."
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand p-2 text-white hover:bg-brand/90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
