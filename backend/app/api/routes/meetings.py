from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.meeting_repository import MeetingRepository
from app.schemas.meeting import (
    ActionItemCreate,
    ActionItemRead,
    ActionItemUpdate,
    GlobalSearchResult,
    MeetingCreate,
    MeetingDetail,
    MeetingListItem,
    MeetingUpdate,
    TagRead,
    TranscriptSegmentRead,
)
from app.services.transcript_parser import (
    estimate_duration_seconds,
    generate_mock_action_items,
    generate_mock_summary,
    generate_mock_topics,
    parse_transcript_file,
)

router = APIRouter(prefix="/meetings", tags=["meetings"])


def get_repo(db: Session = Depends(get_db)) -> MeetingRepository:
    return MeetingRepository(db)


@router.get("", response_model=list[MeetingListItem])
def list_meetings(
    search: str | None = None,
    participant: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    tag: str | None = None,
    sort: str = Query(default="recent", pattern="^(recent|oldest)$"),
    repo: MeetingRepository = Depends(get_repo),
):
    return repo.list_meetings(search, participant, date_from, date_to, tag, sort)


@router.get("/search/global", response_model=list[GlobalSearchResult])
def global_search(q: str = Query(min_length=1), repo: MeetingRepository = Depends(get_repo)):
    return repo.global_search(q)


@router.get("/tags/all", response_model=list[TagRead])
def list_tags(repo: MeetingRepository = Depends(get_repo)):
    return repo.list_tags()


@router.get("/{meeting_id}", response_model=MeetingDetail)
def get_meeting(meeting_id: int, repo: MeetingRepository = Depends(get_repo)):
    meeting = repo.get_meeting(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.post("", response_model=MeetingDetail, status_code=201)
def create_meeting(payload: MeetingCreate, repo: MeetingRepository = Depends(get_repo)):
    return repo.create_meeting(payload)


@router.put("/{meeting_id}", response_model=MeetingDetail)
def update_meeting(
    meeting_id: int, payload: MeetingUpdate, repo: MeetingRepository = Depends(get_repo)
):
    meeting = repo.update_meeting(meeting_id, payload)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(meeting_id: int, repo: MeetingRepository = Depends(get_repo)):
    if not repo.delete_meeting(meeting_id):
        raise HTTPException(status_code=404, detail="Meeting not found")


@router.post("/{meeting_id}/transcript/upload", response_model=MeetingDetail)
async def upload_transcript(
    meeting_id: int,
    file: UploadFile = File(...),
    repo: MeetingRepository = Depends(get_repo),
):
    content = (await file.read()).decode("utf-8", errors="ignore")
    segments = parse_transcript_file(file.filename or "transcript.txt", content)
    if not segments:
        raise HTTPException(status_code=400, detail="Could not parse transcript file")
    meeting = repo.replace_transcript(meeting_id, segments)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.post("/import", response_model=MeetingDetail, status_code=201)
async def import_meeting(
    title: str = Query(..., min_length=1),
    file: UploadFile = File(...),
    participant_names: str = Query(default=""),
    tag_names: str = Query(default=""),
    repo: MeetingRepository = Depends(get_repo),
):
    from datetime import datetime

    content = (await file.read()).decode("utf-8", errors="ignore")
    segments = parse_transcript_file(file.filename or "transcript.txt", content)
    if not segments:
        raise HTTPException(status_code=400, detail="Could not parse transcript file")

    participants = [p.strip() for p in participant_names.split(",") if p.strip()]
    if not participants:
        participants = sorted({seg.speaker for seg in segments})

    tags = [t.strip() for t in tag_names.split(",") if t.strip()]
    action_items = [ActionItemCreate(**item) for item in generate_mock_action_items(segments)]
    from app.schemas.meeting import TopicCreate

    topics = [TopicCreate(**topic) for topic in generate_mock_topics(segments)]

    payload = MeetingCreate(
        title=title,
        meeting_date=datetime.utcnow(),
        duration_seconds=estimate_duration_seconds(segments),
        summary=generate_mock_summary(title, segments),
        participant_names=participants,
        tag_names=tags,
        transcript_segments=segments,
        action_items=action_items,
        topics=topics,
        media_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    )
    return repo.create_meeting(payload)


@router.get("/{meeting_id}/transcript", response_model=list[TranscriptSegmentRead])
def get_transcript(meeting_id: int, repo: MeetingRepository = Depends(get_repo)):
    meeting = repo.get_meeting(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting.transcript_segments


@router.post("/{meeting_id}/action-items", response_model=ActionItemRead, status_code=201)
def create_action_item(
    meeting_id: int, payload: ActionItemCreate, repo: MeetingRepository = Depends(get_repo)
):
    item = repo.create_action_item(meeting_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return item


@router.patch("/action-items/{item_id}", response_model=ActionItemRead)
def update_action_item(
    item_id: int, payload: ActionItemUpdate, repo: MeetingRepository = Depends(get_repo)
):
    item = repo.update_action_item(item_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    return item


@router.delete("/action-items/{item_id}", status_code=204)
def delete_action_item(item_id: int, repo: MeetingRepository = Depends(get_repo)):
    if not repo.delete_action_item(item_id):
        raise HTTPException(status_code=404, detail="Action item not found")
