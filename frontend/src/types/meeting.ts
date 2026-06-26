export interface Participant {
  id: number;
  name: string;
  email?: string | null;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface TranscriptSegment {
  id: number;
  meeting_id: number;
  speaker: string;
  start_ms: number;
  end_ms: number;
  text: string;
  segment_order: number;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  text: string;
  assignee?: string | null;
  due_date?: string | null;
  completed: boolean;
}

export interface Topic {
  id: number;
  meeting_id: number;
  title: string;
  description?: string | null;
  start_ms: number;
}

export interface MeetingListItem {
  id: number;
  title: string;
  meeting_date: string;
  duration_seconds: number;
  summary?: string | null;
  participants: Participant[];
  tags: Tag[];
}

export interface MeetingDetail extends MeetingListItem {
  description?: string | null;
  media_url?: string | null;
  created_at: string;
  updated_at: string;
  transcript_segments: TranscriptSegment[];
  action_items: ActionItem[];
  topics: Topic[];
}

export interface GlobalSearchResult {
  meeting_id: number;
  meeting_title: string;
  match_type: string;
  snippet: string;
  segment_id?: number | null;
  start_ms?: number | null;
}

export interface AskQuestionResponse {
  answer: string;
  source_segments: TranscriptSegment[];
  used_llm: boolean;
}

export interface MeetingCreatePayload {
  title: string;
  description?: string;
  meeting_date: string;
  duration_seconds?: number;
  media_url?: string;
  summary?: string;
  participant_names?: string[];
  tag_names?: string[];
  transcript_segments?: Omit<TranscriptSegment, "id" | "meeting_id">[];
  action_items?: Omit<ActionItem, "id" | "meeting_id">[];
  topics?: Omit<Topic, "id" | "meeting_id">[];
}
