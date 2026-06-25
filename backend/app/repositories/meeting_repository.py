from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models import ActionItem, Meeting, Participant, Tag, Topic, TranscriptSegment
from app.schemas.meeting import (
    ActionItemCreate,
    ActionItemUpdate,
    GlobalSearchResult,
    MeetingCreate,
    MeetingUpdate,
    TranscriptSegmentCreate,
)


class MeetingRepository:
    def __init__(self, db: Session):
        self.db = db

    def _get_or_create_participant(self, name: str) -> Participant:
        participant = self.db.query(Participant).filter(Participant.name == name).first()
        if participant:
            return participant
        participant = Participant(name=name)
        self.db.add(participant)
        self.db.flush()
        return participant

    def _get_or_create_tag(self, name: str) -> Tag:
        tag = self.db.query(Tag).filter(Tag.name == name).first()
        if tag:
            return tag
        colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"]
        tag = Tag(name=name, color=colors[len(name) % len(colors)])
        self.db.add(tag)
        self.db.flush()
        return tag

    def list_meetings(
        self,
        search: str | None = None,
        participant: str | None = None,
        date_from: str | None = None,
        date_to: str | None = None,
        tag: str | None = None,
        sort: str = "recent",
    ) -> list[Meeting]:
        query = self.db.query(Meeting).options(
            joinedload(Meeting.participants),
            joinedload(Meeting.tags),
        )
        if search:
            like = f"%{search}%"
            query = query.filter(or_(Meeting.title.ilike(like), Meeting.summary.ilike(like)))
        if participant:
            query = query.join(Meeting.participants).filter(Participant.name.ilike(f"%{participant}%"))
        if tag:
            query = query.join(Meeting.tags).filter(Tag.name.ilike(f"%{tag}%"))
        if date_from:
            query = query.filter(Meeting.meeting_date >= date_from)
        if date_to:
            query = query.filter(Meeting.meeting_date <= date_to)
        if sort == "oldest":
            query = query.order_by(Meeting.meeting_date.asc())
        else:
            query = query.order_by(Meeting.meeting_date.desc())
        return query.distinct().all()

    def get_meeting(self, meeting_id: int) -> Meeting | None:
        return (
            self.db.query(Meeting)
            .options(
                joinedload(Meeting.participants),
                joinedload(Meeting.tags),
                joinedload(Meeting.transcript_segments),
                joinedload(Meeting.action_items),
                joinedload(Meeting.topics),
            )
            .filter(Meeting.id == meeting_id)
            .first()
        )

    def create_meeting(self, payload: MeetingCreate) -> Meeting:
        meeting = Meeting(
            title=payload.title,
            description=payload.description,
            meeting_date=payload.meeting_date,
            duration_seconds=payload.duration_seconds,
            media_url=payload.media_url,
            summary=payload.summary,
        )
        self.db.add(meeting)
        self.db.flush()

        for name in payload.participant_names:
            meeting.participants.append(self._get_or_create_participant(name))
        for name in payload.tag_names:
            meeting.tags.append(self._get_or_create_tag(name))

        for seg in payload.transcript_segments:
            meeting.transcript_segments.append(TranscriptSegment(**seg.model_dump()))
        for item in payload.action_items:
            meeting.action_items.append(ActionItem(**item.model_dump()))
        for topic in payload.topics:
            meeting.topics.append(Topic(**topic.model_dump()))

        self.db.commit()
        self.db.refresh(meeting)
        return self.get_meeting(meeting.id)  # type: ignore[return-value]

    def update_meeting(self, meeting_id: int, payload: MeetingUpdate) -> Meeting | None:
        meeting = self.get_meeting(meeting_id)
        if not meeting:
            return None
        data = payload.model_dump(exclude_unset=True)
        participant_names = data.pop("participant_names", None)
        tag_names = data.pop("tag_names", None)
        for key, value in data.items():
            setattr(meeting, key, value)
        if participant_names is not None:
            meeting.participants = [self._get_or_create_participant(n) for n in participant_names]
        if tag_names is not None:
            meeting.tags = [self._get_or_create_tag(n) for n in tag_names]
        self.db.commit()
        return self.get_meeting(meeting_id)

    def delete_meeting(self, meeting_id: int) -> bool:
        meeting = self.db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if not meeting:
            return False
        self.db.delete(meeting)
        self.db.commit()
        return True

    def replace_transcript(self, meeting_id: int, segments: list[TranscriptSegmentCreate]) -> Meeting | None:
        meeting = self.get_meeting(meeting_id)
        if not meeting:
            return None
        meeting.transcript_segments.clear()
        for seg in segments:
            meeting.transcript_segments.append(TranscriptSegment(**seg.model_dump()))
        self.db.commit()
        return self.get_meeting(meeting_id)

    def create_action_item(self, meeting_id: int, payload: ActionItemCreate) -> ActionItem | None:
        meeting = self.db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if not meeting:
            return None
        item = ActionItem(meeting_id=meeting_id, **payload.model_dump())
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update_action_item(self, item_id: int, payload: ActionItemUpdate) -> ActionItem | None:
        item = self.db.query(ActionItem).filter(ActionItem.id == item_id).first()
        if not item:
            return None
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(item, key, value)
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete_action_item(self, item_id: int) -> bool:
        item = self.db.query(ActionItem).filter(ActionItem.id == item_id).first()
        if not item:
            return False
        self.db.delete(item)
        self.db.commit()
        return True

    def global_search(self, query: str, limit: int = 20) -> list[GlobalSearchResult]:
        like = f"%{query}%"
        results: list[GlobalSearchResult] = []
        meetings = self.db.query(Meeting).filter(
            or_(Meeting.title.ilike(like), Meeting.summary.ilike(like))
        ).limit(limit).all()
        for meeting in meetings:
            snippet = meeting.summary or meeting.title
            results.append(
                GlobalSearchResult(
                    meeting_id=meeting.id,
                    meeting_title=meeting.title,
                    match_type="summary" if meeting.summary and query.lower() in meeting.summary.lower() else "title",
                    snippet=snippet[:200],
                )
            )
        segments = (
            self.db.query(TranscriptSegment)
            .join(Meeting)
            .filter(TranscriptSegment.text.ilike(like))
            .limit(limit)
            .all()
        )
        for seg in segments:
            results.append(
                GlobalSearchResult(
                    meeting_id=seg.meeting_id,
                    meeting_title=seg.meeting.title,
                    match_type="transcript",
                    snippet=seg.text[:200],
                    segment_id=seg.id,
                    start_ms=seg.start_ms,
                )
            )
        return results[:limit]

    def list_tags(self) -> list[Tag]:
        return self.db.query(Tag).order_by(Tag.name).all()
