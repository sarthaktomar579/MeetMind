"""Seed database with realistic sample meetings."""

from datetime import datetime, timedelta

from app.core.database import SessionLocal, init_db
from app.repositories.meeting_repository import MeetingRepository
from app.schemas.meeting import ActionItemCreate, MeetingCreate, TopicCreate, TranscriptSegmentCreate

SAMPLE_MEDIA = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"


def _seg(speaker: str, start: int, end: int, text: str, order: int) -> TranscriptSegmentCreate:
    return TranscriptSegmentCreate(
        speaker=speaker, start_ms=start, end_ms=end, text=text, segment_order=order
    )


MEETINGS = [
    {
        "title": "Q1 Product Roadmap Review",
        "description": "Quarterly planning session for product priorities.",
        "meeting_date": datetime.utcnow() - timedelta(days=2, hours=3),
        "duration_seconds": 3420,
        "tags": ["Product", "Planning"],
        "participants": ["Sarah Chen", "Marcus Johnson", "Priya Patel", "Alex Rivera"],
        "summary": (
            "The team aligned on Q1 priorities: launching the redesigned onboarding flow, "
            "shipping mobile push notifications, and improving dashboard load times by 40%. "
            "Sarah will own the onboarding epic, Marcus leads notifications, and Priya drives performance. "
            "Budget approval for two additional engineers is pending leadership sign-off."
        ),
        "topics": [
            ("Goals & KPIs", "Review Q1 OKRs and success metrics", 0),
            ("Onboarding redesign", "Walkthrough of new user flow mockups", 180000),
            ("Engineering capacity", "Hiring plan and sprint allocation", 420000),
        ],
        "action_items": [
            ("Finalize onboarding wireframes by Friday", "Sarah Chen", False),
            ("Draft notification spec for iOS and Android", "Marcus Johnson", False),
            ("Run Lighthouse audit on dashboard", "Priya Patel", True),
            ("Schedule leadership review for headcount ask", "Alex Rivera", False),
        ],
        "segments": [
            _seg("Sarah Chen", 0, 12000, "Good morning everyone. Let's kick off our Q1 roadmap review.", 0),
            _seg("Alex Rivera", 12000, 28000, "Thanks Sarah. Our north star this quarter is activation rate — we need to hit 35%.", 1),
            _seg("Marcus Johnson", 28000, 52000, "On notifications, we have buy-in from design. I'll share the spec draft by next week.", 2),
            _seg("Priya Patel", 52000, 78000, "Performance-wise, the dashboard LCP is at 3.2 seconds. We should target under 2.", 3),
            _seg("Sarah Chen", 78000, 105000, "Agreed. Let's prioritize onboarding first since it has the highest impact on activation.", 4),
            _seg("Alex Rivera", 105000, 128000, "I'll follow up with leadership on the headcount request before end of month.", 5),
        ],
    },
    {
        "title": "Engineering Standup — Sprint 14",
        "description": "Daily sync for backend and frontend teams.",
        "meeting_date": datetime.utcnow() - timedelta(days=1, hours=5),
        "duration_seconds": 900,
        "tags": ["Engineering", "Standup"],
        "participants": ["James Okonkwo", "Emily Zhang", "David Kim"],
        "summary": (
            "Sprint 14 is on track. James completed the API rate limiting middleware. "
            "Emily is blocked on design tokens for the settings page. David will pair with Emily "
            "after standup. No deploys planned until Thursday."
        ),
        "topics": [
            ("Yesterday", "Individual updates", 0),
            ("Blockers", "Design dependency discussion", 120000),
            ("Today", "Planned work items", 300000),
        ],
        "action_items": [
            ("Ping design for settings tokens", "Emily Zhang", False),
            ("Review PR #284 for rate limiter", "David Kim", False),
        ],
        "segments": [
            _seg("James Okonkwo", 0, 8000, "Yesterday I merged the rate limiting middleware. Today I'll start on caching.", 0),
            _seg("Emily Zhang", 8000, 20000, "I'm blocked on settings page — still waiting on design tokens.", 1),
            _seg("David Kim", 20000, 35000, "I can pair with Emily after this. I'll also review James's PR.", 2),
            _seg("James Okonkwo", 35000, 48000, "Sounds good. Let's aim for Thursday deploy window.", 3),
        ],
    },
    {
        "title": "Customer Discovery — Acme Corp",
        "description": "Discovery call with enterprise prospect.",
        "meeting_date": datetime.utcnow() - timedelta(days=4),
        "duration_seconds": 2700,
        "tags": ["Sales", "Customer"],
        "participants": ["Lisa Morgan", "Tom Bradley", "Rachel Adams"],
        "summary": (
            "Acme Corp needs SSO, audit logs, and custom retention policies for meeting data. "
            "Their security review is scheduled for next month. Rachel will send the enterprise feature matrix. "
            "Tom identified compliance as the primary buying trigger."
        ),
        "topics": [
            ("Introductions", "Team intros and context", 0),
            ("Requirements", "SSO, audit logs, retention", 240000),
            ("Next steps", "Security review timeline", 600000),
        ],
        "action_items": [
            ("Send enterprise feature comparison doc", "Rachel Adams", True),
            ("Prepare SOC 2 summary for security review", "Tom Bradley", False),
            ("Schedule technical deep-dive with their IT team", "Lisa Morgan", False),
        ],
        "segments": [
            _seg("Lisa Morgan", 0, 15000, "Thanks for joining. We'd love to understand your meeting intelligence needs.", 0),
            _seg("Tom Bradley", 15000, 45000, "We need SSO with Okta and full audit logs for who accessed transcripts.", 1),
            _seg("Rachel Adams", 45000, 72000, "Our enterprise tier covers both. I'll send the feature matrix after this call.", 2),
            _seg("Tom Bradley", 72000, 98000, "Compliance is our main driver — we need 90-day retention controls.", 3),
        ],
    },
    {
        "title": "Design Critique — Meeting Detail Page",
        "description": "UI review of transcript and summary layout.",
        "meeting_date": datetime.utcnow() - timedelta(days=6),
        "duration_seconds": 1800,
        "tags": ["Design", "Product"],
        "participants": ["Nina Kowalski", "Chris Lee", "Jordan Blake"],
        "summary": (
            "The team approved the three-panel layout: media player on top, transcript left, insights right. "
            "Active transcript highlighting should use a subtle purple tint. Jordan will update Figma by Wednesday."
        ),
        "topics": [
            ("Layout review", "Three-panel structure", 0),
            ("Interaction patterns", "Click-to-seek behavior", 300000),
            ("Visual polish", "Colors, spacing, typography", 540000),
        ],
        "action_items": [
            ("Update Figma with approved layout", "Jordan Blake", False),
            ("Add keyboard shortcuts to spec", "Chris Lee", False),
        ],
        "segments": [
            _seg("Nina Kowalski", 0, 18000, "Let's review the meeting detail page. The three-panel layout feels right.", 0),
            _seg("Chris Lee", 18000, 42000, "Clicking a transcript line should seek the player — that's core to the experience.", 1),
            _seg("Jordan Blake", 42000, 65000, "I'll use a light purple for the active segment. Matches our brand.", 2),
        ],
    },
    {
        "title": "All-Hands — Company Update",
        "description": "Monthly all-hands with leadership updates.",
        "meeting_date": datetime.utcnow() - timedelta(days=10),
        "duration_seconds": 3600,
        "tags": ["Company", "All-Hands"],
        "participants": ["CEO — Morgan Ellis", "CTO — Sam Wright", "VP People — Dana Fox"],
        "summary": (
            "Company grew 22% MoM. Series A close expected in 6 weeks. New office opening in Austin. "
            "Engineering hiring freeze lifted for 3 senior roles. Employee referral bonus increased to $5k."
        ),
        "topics": [
            ("Business metrics", "Revenue and growth", 0),
            ("Funding update", "Series A progress", 600000),
            ("People & culture", "Hiring and office news", 1200000),
        ],
        "action_items": [
            ("Share Austin office FAQ", "Dana Fox", True),
            ("Post open senior role descriptions", "Sam Wright", False),
        ],
        "segments": [
            _seg("Morgan Ellis", 0, 30000, "Welcome everyone. We grew 22% month over month — incredible work.", 0),
            _seg("Sam Wright", 30000, 75000, "We're lifting the hiring freeze for three senior engineering roles.", 1),
            _seg("Dana Fox", 75000, 110000, "Austin office opens in September. Referral bonus is now five thousand dollars.", 2),
        ],
    },
    {
        "title": "Security Review — Data Retention Policy",
        "description": "Internal security review for data handling.",
        "meeting_date": datetime.utcnow() - timedelta(days=14),
        "duration_seconds": 2400,
        "tags": ["Security", "Compliance"],
        "participants": ["Kevin Park", "Amanda Liu", "Roberto Silva"],
        "summary": (
            "Agreed on 365-day default retention with admin-configurable policies. "
            "Transcripts encrypted at rest. Roberto will document the deletion workflow for GDPR requests."
        ),
        "topics": [
            ("Current state", "Data storage audit", 0),
            ("Retention policy", "Default and custom rules", 360000),
            ("GDPR compliance", "Right to deletion process", 720000),
        ],
        "action_items": [
            ("Document GDPR deletion workflow", "Roberto Silva", False),
            ("Implement retention config API", "Kevin Park", False),
            ("Review encryption key rotation schedule", "Amanda Liu", True),
        ],
        "segments": [
            _seg("Kevin Park", 0, 22000, "We store transcripts in encrypted SQLite blobs with per-tenant keys.", 0),
            _seg("Amanda Liu", 22000, 50000, "Default retention should be 365 days with admin override.", 1),
            _seg("Roberto Silva", 50000, 80000, "I'll document the GDPR deletion workflow by next Friday.", 2),
        ],
    },
]


def seed() -> None:
    init_db()
    db = SessionLocal()
    repo = MeetingRepository(db)
    try:
        existing = repo.list_meetings()
        if existing:
            print(f"Database already has {len(existing)} meetings — skipping seed.")
            return

        for data in MEETINGS:
            payload = MeetingCreate(
                title=data["title"],
                description=data["description"],
                meeting_date=data["meeting_date"],
                duration_seconds=data["duration_seconds"],
                media_url=SAMPLE_MEDIA,
                summary=data["summary"],
                participant_names=data["participants"],
                tag_names=data["tags"],
                transcript_segments=data["segments"],
                action_items=[
                    ActionItemCreate(text=text, assignee=assignee, completed=done)
                    for text, assignee, done in data["action_items"]
                ],
                topics=[
                    TopicCreate(title=title, description=desc, start_ms=start)
                    for title, desc, start in data["topics"]
                ],
            )
            meeting = repo.create_meeting(payload)
            print(f"  + {meeting.title} (id={meeting.id})")

        print(f"\nSeeded {len(MEETINGS)} meetings successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
