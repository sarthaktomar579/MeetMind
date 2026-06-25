"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { MeetingFiltersBar } from "@/components/meetings/MeetingFilters";
import { CreateMeetingModal } from "@/components/meetings/CreateMeetingModal";
import { api, MeetingFilters } from "@/lib/api";
import { MeetingListItem } from "@/types/meeting";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<MeetingFilters>({ sort: "recent" });
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listMeetings({ ...filters, search: search || undefined });
      setMeetings(data);
    } catch {
      setError("Could not load meetings. Is the backend running on port 8000?");
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => {
    const timer = setTimeout(loadMeetings, 300);
    return () => clearTimeout(timer);
  }, [loadMeetings]);

  return (
    <>
      <Navbar
        title="Meetings"
        subtitle={`${meetings.length} recordings in your workspace`}
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90"
          >
            <Plus className="h-4 w-4" />
            New Meeting
          </button>
        }
      />

      <div className="space-y-6 p-6">
        <MeetingFiltersBar filters={filters} onChange={setFilters} />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-border/50" />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted">No meetings found. Create one or adjust your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {meetings.map((m) => (
              <MeetingCard key={m.id} meeting={m} />
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateMeetingModal onClose={() => setShowCreate(false)} />}
    </>
  );
}
