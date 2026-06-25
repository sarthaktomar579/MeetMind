"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";

interface CreateMeetingModalProps {
  onClose: () => void;
}

export function CreateMeetingModal({ onClose }: CreateMeetingModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"form" | "import">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState("");
  const [summary, setSummary] = useState("");
  const [transcript, setTranscript] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [importTags, setImportTags] = useState("");

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const lines = transcript
        .split("\n")
        .filter(Boolean)
        .map((line, i) => {
          const [speaker, ...rest] = line.includes(":") ? line.split(":") : ["Speaker", line];
          return {
            speaker: speaker.trim(),
            start_ms: i * 5000,
            end_ms: (i + 1) * 5000,
            text: (rest.join(":") || line).trim(),
            segment_order: i,
          };
        });

      const meeting = await api.createMeeting({
        title,
        meeting_date: new Date().toISOString(),
        duration_seconds: lines.length * 5,
        summary: summary || undefined,
        participant_names: participants.split(",").map((p) => p.trim()).filter(Boolean),
        transcript_segments: lines,
      });
      router.push(`/meetings/${meeting.id}`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create meeting");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title) return;
    setLoading(true);
    setError("");
    try {
      const meeting = await api.importMeeting(title, file, participants, importTags);
      router.push(`/meetings/${meeting.id}`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import meeting");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">New Meeting</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-background">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-border">
          {(["form", "import"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium ${
                tab === t ? "border-b-2 border-brand text-brand" : "text-muted"
              }`}
            >
              {t === "form" ? "Create from form" : "Import file"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {tab === "form" ? (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                required
                placeholder="Meeting title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              />
              <input
                placeholder="Participants (comma-separated)"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              />
              <textarea
                placeholder="Summary (optional)"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              />
              <textarea
                required
                placeholder="Transcript (one line per segment, e.g. 'Sarah: Hello everyone')"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Meeting"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleImport} className="space-y-4">
              <input
                required
                placeholder="Meeting title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              />
              <input
                placeholder="Participants (comma-separated)"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              />
              <input
                placeholder="Tags (comma-separated)"
                value={importTags}
                onChange={(e) => setImportTags(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
              />
              <input
                required
                type="file"
                accept=".txt,.vtt,.json"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
              <p className="text-xs text-muted">Supports .txt, .vtt, and .json transcript formats</p>
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
              >
                {loading ? "Importing..." : "Import Meeting"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
