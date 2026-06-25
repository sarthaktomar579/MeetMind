"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { MeetingDetail } from "@/types/meeting";

interface EditMeetingModalProps {
  meeting: MeetingDetail;
  onClose: () => void;
  onSaved: (meeting: MeetingDetail) => void;
}

export function EditMeetingModal({ meeting, onClose, onSaved }: EditMeetingModalProps) {
  const [title, setTitle] = useState(meeting.title);
  const [participants, setParticipants] = useState(meeting.participants.map((p) => p.name).join(", "));
  const [summary, setSummary] = useState(meeting.summary || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateMeeting(meeting.id, {
        title,
        summary,
        participant_names: participants.split(",").map((p) => p.trim()).filter(Boolean),
      });
      onSaved(updated);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Edit Meeting</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-background">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
          />
          <input
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            placeholder="Participants"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
          />
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            placeholder="Summary"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
