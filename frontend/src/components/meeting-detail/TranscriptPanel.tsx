"use client";

import { useMemo } from "react";
import { Search } from "lucide-react";
import { TranscriptSegment } from "@/types/meeting";
import { cn, formatTimestamp } from "@/lib/utils";

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  activeSegmentId: number | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSegmentClick: (segment: TranscriptSegment) => void;
}

export function TranscriptPanel({
  segments,
  activeSegmentId,
  searchQuery,
  onSearchChange,
  onSegmentClick,
}: TranscriptPanelProps) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return segments;
    const q = searchQuery.toLowerCase();
    return segments.filter(
      (s) => s.text.toLowerCase().includes(q) || s.speaker.toLowerCase().includes(q)
    );
  }, [segments, searchQuery]);

  function highlightText(text: string) {
    if (!searchQuery.trim()) return text;
    const q = searchQuery.trim();
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-800">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="mb-3 text-sm font-semibold">Transcript</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search in transcript..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm outline-none ring-brand focus:ring-2"
          />
        </div>
      </div>

      <div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted">No matching segments</p>
        ) : (
          filtered.map((segment) => (
            <button
              key={segment.id}
              id={`segment-${segment.id}`}
              onClick={() => onSegmentClick(segment)}
              className={cn(
                "w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-brand-muted/50",
                activeSegmentId === segment.id && "bg-active-transcript ring-1 ring-brand/30"
              )}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-medium text-brand">{segment.speaker}</span>
                <span className="text-[10px] text-muted">{formatTimestamp(segment.start_ms)}</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{highlightText(segment.text)}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
