import {
  ActionItem,
  AskQuestionResponse,
  GlobalSearchResult,
  MeetingCreatePayload,
  MeetingDetail,
  MeetingListItem,
  Tag,
  TranscriptSegment,
} from "@/types/meeting";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface MeetingFilters {
  search?: string;
  participant?: string;
  date_from?: string;
  date_to?: string;
  tag?: string;
  sort?: "recent" | "oldest";
}

export const api = {
  listMeetings: (filters: MeetingFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    const qs = params.toString();
    return request<MeetingListItem[]>(`/api/meetings${qs ? `?${qs}` : ""}`);
  },

  getMeeting: (id: number) => request<MeetingDetail>(`/api/meetings/${id}`),

  createMeeting: (payload: MeetingCreatePayload) =>
    request<MeetingDetail>("/api/meetings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateMeeting: (id: number, payload: Partial<MeetingCreatePayload>) =>
    request<MeetingDetail>(`/api/meetings/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteMeeting: (id: number) =>
    request<void>(`/api/meetings/${id}`, { method: "DELETE" }),

  globalSearch: (q: string) =>
    request<GlobalSearchResult[]>(`/api/meetings/search/global?q=${encodeURIComponent(q)}`),

  listTags: () => request<Tag[]>("/api/meetings/tags/all"),

  getTranscript: (id: number) =>
    request<TranscriptSegment[]>(`/api/meetings/${id}/transcript`),

  createActionItem: (meetingId: number, text: string, assignee?: string) =>
    request<ActionItem>(`/api/meetings/${meetingId}/action-items`, {
      method: "POST",
      body: JSON.stringify({ text, assignee, completed: false }),
    }),

  updateActionItem: (
    itemId: number,
    payload: Partial<{ text: string; assignee: string; completed: boolean }>
  ) =>
    request<ActionItem>(`/api/meetings/action-items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteActionItem: (itemId: number) =>
    request<void>(`/api/meetings/action-items/${itemId}`, { method: "DELETE" }),

  importMeeting: async (title: string, file: File, participants = "", tags = "") => {
    const form = new FormData();
    form.append("file", file);
    const params = new URLSearchParams({ title, participant_names: participants, tag_names: tags });
    return request<MeetingDetail>(`/api/meetings/import?${params}`, {
      method: "POST",
      body: form,
    });
  },

  askQuestion: (meetingId: number, question: string) =>
    request<AskQuestionResponse>(`/api/meetings/${meetingId}/ask`, {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
};
