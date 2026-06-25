from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ParticipantBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str | None = None


class ParticipantCreate(ParticipantBase):
    pass


class ParticipantRead(ParticipantBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class TagRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    color: str


class TranscriptSegmentBase(BaseModel):
    speaker: str
    start_ms: int = Field(ge=0)
    end_ms: int = Field(ge=0)
    text: str
    segment_order: int = 0


class TranscriptSegmentCreate(TranscriptSegmentBase):
    pass


class TranscriptSegmentRead(TranscriptSegmentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    meeting_id: int


class ActionItemBase(BaseModel):
    text: str
    assignee: str | None = None
    due_date: date | None = None
    completed: bool = False


class ActionItemCreate(ActionItemBase):
    pass


class ActionItemUpdate(BaseModel):
    text: str | None = None
    assignee: str | None = None
    due_date: date | None = None
    completed: bool | None = None


class ActionItemRead(ActionItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    meeting_id: int


class TopicBase(BaseModel):
    title: str
    description: str | None = None
    start_ms: int = 0


class TopicCreate(TopicBase):
    pass


class TopicRead(TopicBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    meeting_id: int


class MeetingBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    meeting_date: datetime
    duration_seconds: int = Field(ge=0, default=0)
    media_url: str | None = None
    summary: str | None = None


class MeetingCreate(MeetingBase):
    participant_names: list[str] = []
    tag_names: list[str] = []
    transcript_segments: list[TranscriptSegmentCreate] = []
    action_items: list[ActionItemCreate] = []
    topics: list[TopicCreate] = []


class MeetingUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    meeting_date: datetime | None = None
    duration_seconds: int | None = None
    media_url: str | None = None
    summary: str | None = None
    participant_names: list[str] | None = None
    tag_names: list[str] | None = None


class MeetingListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    meeting_date: datetime
    duration_seconds: int
    summary: str | None
    participants: list[ParticipantRead]
    tags: list[TagRead]


class MeetingDetail(MeetingBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime
    participants: list[ParticipantRead]
    tags: list[TagRead]
    transcript_segments: list[TranscriptSegmentRead]
    action_items: list[ActionItemRead]
    topics: list[TopicRead]


class GlobalSearchResult(BaseModel):
    meeting_id: int
    meeting_title: str
    match_type: str
    snippet: str
    segment_id: int | None = None
    start_ms: int | None = None
