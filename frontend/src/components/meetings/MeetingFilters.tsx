"use client";

import { MeetingFilters as Filters } from "@/lib/api";

interface MeetingFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function MeetingFiltersBar({ filters, onChange }: MeetingFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
      <input
        type="text"
        placeholder="Filter by participant..."
        value={filters.participant || ""}
        onChange={(e) => onChange({ ...filters, participant: e.target.value || undefined })}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
      />
      <input
        type="text"
        placeholder="Filter by tag..."
        value={filters.tag || ""}
        onChange={(e) => onChange({ ...filters, tag: e.target.value || undefined })}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
      />
      <input
        type="date"
        value={filters.date_from || ""}
        onChange={(e) => onChange({ ...filters, date_from: e.target.value || undefined })}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
      />
      <input
        type="date"
        value={filters.date_to || ""}
        onChange={(e) => onChange({ ...filters, date_to: e.target.value || undefined })}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
      />
      <select
        value={filters.sort || "recent"}
        onChange={(e) => onChange({ ...filters, sort: e.target.value as "recent" | "oldest" })}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-brand focus:ring-2"
      >
        <option value="recent">Most recent</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>
  );
}
