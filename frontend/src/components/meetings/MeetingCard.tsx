import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { MeetingListItem } from "@/types/meeting";
import { formatDuration, formatMeetingDate } from "@/lib/utils";

export function MeetingCard({ meeting }: { meeting: MeetingListItem }) {
  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="group block rounded-xl border border-border bg-card p-5 transition-all hover:border-brand/40 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-semibold text-foreground group-hover:text-brand">{meeting.title}</h3>
        <div className="flex shrink-0 gap-1.5">
          {meeting.tags.slice(0, 2).map((tag) => (
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

      {meeting.summary && (
        <p className="mb-4 line-clamp-2 text-sm text-muted">{meeting.summary}</p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
        <span>{formatMeetingDate(meeting.meeting_date)}</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatDuration(meeting.duration_seconds)}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {meeting.participants.map((p) => p.name).join(", ")}
        </span>
      </div>
    </Link>
  );
}
