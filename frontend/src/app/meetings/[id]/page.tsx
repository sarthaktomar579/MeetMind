"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Pencil, Trash2 } from "lucide-react";
import { MediaPlayer, MediaPlayerHandle } from "@/components/meeting-detail/MediaPlayer";
import { SummaryPanel } from "@/components/meeting-detail/SummaryPanel";
import { TranscriptPanel } from "@/components/meeting-detail/TranscriptPanel";
import { EditMeetingModal } from "@/components/meetings/EditMeetingModal";
import { api } from "@/lib/api";
import { formatDuration, formatMeetingDate } from "@/lib/utils";
import { ActionItem, MeetingDetail, TranscriptSegment } from "@/types/meeting";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const playerRef = useRef<MediaPlayerHandle>(null);

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSegmentId, setActiveSegmentId] = useState<number | null>(null);
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  const loadMeeting = useCallback(async () => {
    try {
      const data = await api.getMeeting(id);
      setMeeting(data);
    } catch {
      router.push("/meetings");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadMeeting();
  }, [loadMeeting]);

  useEffect(() => {
    if (!meeting) return;
    const active = meeting.transcript_segments.find(
      (s) => currentTimeMs >= s.start_ms && currentTimeMs < s.end_ms
    );
    setActiveSegmentId(active?.id ?? null);
    if (active) {
      document.getElementById(`segment-${active.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentTimeMs, meeting]);

  function handleSegmentClick(segment: TranscriptSegment) {
    playerRef.current?.seekTo(segment.start_ms);
    setCurrentTimeMs(segment.start_ms);
    setActiveSegmentId(segment.id);
  }

  function handleSeek(ms: number) {
    setCurrentTimeMs(ms);
  }

  async function handleDelete() {
    if (!confirm("Delete this meeting permanently?")) return;
    await api.deleteMeeting(id);
    router.push("/meetings");
  }

  function exportTranscript() {
    if (!meeting) return;
    const text = meeting.transcript_segments
      .map((s) => `[${Math.floor(s.start_ms / 60000)}:${String(Math.floor((s.start_ms % 60000) / 1000)).padStart(2, "0")}] ${s.speaker}: ${s.text}`)
      .join("\n\n");
    const blob = new Blob([`# ${meeting.title}\n\n${text}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meeting.title.replace(/\s+/g, "-").toLowerCase()}-transcript.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading || !meeting) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => router.push("/meetings")}
              className="mb-2 flex items-center gap-1 text-xs text-muted hover:text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to meetings
            </button>
            <h1 className="text-xl font-semibold">{meeting.title}</h1>
            <p className="mt-1 text-sm text-muted">
              {formatMeetingDate(meeting.meeting_date)} · {formatDuration(meeting.duration_seconds)} ·{" "}
              {meeting.participants.map((p) => p.name).join(", ")}
            </p>
            <div className="mt-2 flex gap-2">
              {meeting.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportTranscript}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-background"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-background"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-background px-6 py-4">
        <MediaPlayer
          ref={playerRef}
          src={meeting.media_url}
          durationSeconds={meeting.duration_seconds}
          currentTimeMs={currentTimeMs}
          isPlaying={isPlaying}
          onTimeUpdate={setCurrentTimeMs}
          onPlayStateChange={setIsPlaying}
          onSeek={handleSeek}
        />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-6 lg:grid-cols-2">
        <TranscriptPanel
          segments={meeting.transcript_segments}
          activeSegmentId={activeSegmentId}
          searchQuery={transcriptSearch}
          onSearchChange={setTranscriptSearch}
          onSegmentClick={handleSegmentClick}
        />
        <SummaryPanel
          meetingId={meeting.id}
          summary={meeting.summary}
          topics={meeting.topics}
          actionItems={meeting.action_items}
          onActionItemsChange={(items: ActionItem[]) => setMeeting({ ...meeting, action_items: items })}
          onTopicClick={(ms) => handleSegmentClick(
            meeting.transcript_segments.find((s) => s.start_ms === ms) ||
            meeting.transcript_segments[0]
          )}
        />
      </div>

      {showEdit && (
        <EditMeetingModal
          meeting={meeting}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => {
            setMeeting(updated);
            setShowEdit(false);
          }}
        />
      )}
    </div>
  );
}
