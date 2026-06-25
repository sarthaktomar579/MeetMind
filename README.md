# MeetMind

**Meeting intelligence workspace** — a Fireflies.ai-inspired platform for browsing meeting transcripts, AI summaries, action items, and topics.

Live demo: _Deploy to Vercel + Render and add URL here_

Repository: [github.com/sarthaktomar579/MeetMind](https://github.com/sarthaktomar579/MeetMind)

---

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend  | FastAPI, SQLAlchemy 2, Pydantic v2 |
| Database | SQLite |
| Icons    | Lucide React |

---

## Features

### Core (implemented)
- **Meetings library** — list with title, date, duration, participants, tags
- **Search & filter** — by title/summary, participant, date range, tag; sort by recency
- **Meeting detail** — media player with seek bar, interactive transcript, AI summary panel
- **Transcript sync** — click segment to seek; playback highlights active segment
- **In-transcript search** — with highlighted matches
- **AI summary & topics** — seeded/mock summaries, chapter outline with click-to-seek
- **Action items** — add, edit, complete, delete with persistence
- **CRUD** — create (form or file import), edit metadata, delete meetings
- **Transcript import** — `.txt`, `.vtt`, `.json` with auto-summary generation
- **Export** — download transcript as Markdown
- **Dark mode** — toggle in sidebar
- **Settings** — placeholder page for integrations

### Placeholders (per assignment)
- Real-time STT / meeting bot
- Zoom, Google Meet, calendar integrations
- Team sharing & real authentication (default user assumed)

---

## Project Structure

```
MeetMind/
├── frontend/                 # Next.js application
│   └── src/
│       ├── app/              # App Router pages
│       ├── components/       # UI components
│       ├── lib/              # API client & utilities
│       └── types/            # TypeScript interfaces
├── backend/                  # FastAPI application
│   └── app/
│       ├── api/routes/       # REST endpoints
│       ├── core/             # Config & database
│       ├── models/           # SQLAlchemy ORM
│       ├── schemas/          # Pydantic models
│       ├── repositories/     # Data access layer
│       ├── services/         # Transcript parsing
│       └── seed/             # Sample data
└── README.md
```

---

## Architecture

```
┌─────────────┐     REST/JSON      ┌─────────────┐     SQLAlchemy     ┌────────┐
│  Next.js    │ ◄───────────────► │   FastAPI   │ ◄────────────────► │ SQLite │
│  Frontend   │   localhost:3000   │   Backend   │                    │   DB   │
└─────────────┘   localhost:8000   └─────────────┘                    └────────┘
```

**Backend layers:** Routes → Repository → SQLAlchemy Models  
**Frontend layers:** Pages → Components → API Client → Backend

---

## Database Schema

```
meetings
├── id, title, description, meeting_date, duration_seconds
├── media_url, summary, created_at, updated_at
│
├── meeting_participants (M2M) ──► participants (id, name, email)
├── meeting_tags (M2M) ──────────► tags (id, name, color)
├── transcript_segments (meeting_id, speaker, start_ms, end_ms, text, segment_order)
├── action_items (meeting_id, text, assignee, due_date, completed)
└── topics (meeting_id, title, description, start_ms)
```

---

## API Overview

Base URL: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/meetings` | List meetings (search, filter, sort) |
| GET | `/api/meetings/{id}` | Meeting detail |
| POST | `/api/meetings` | Create meeting |
| PUT | `/api/meetings/{id}` | Update meeting |
| DELETE | `/api/meetings/{id}` | Delete meeting |
| POST | `/api/meetings/import` | Import from transcript file |
| POST | `/api/meetings/{id}/transcript/upload` | Replace transcript |
| GET | `/api/meetings/search/global?q=` | Global search |
| GET | `/api/meetings/tags/all` | List all tags |
| POST | `/api/meetings/{id}/action-items` | Create action item |
| PATCH | `/api/meetings/action-items/{id}` | Update action item |
| DELETE | `/api/meetings/action-items/{id}` | Delete action item |

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11–3.13 (3.13 recommended; 3.14 not yet supported by all deps)

### Backend

```bash
cd backend
py -3.13 -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python -m app.seed.run
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open **http://localhost:3000** — the app connects to the API at **http://localhost:8000**.

---

## Environment Variables

**Backend** (`backend/.env`):

| Variable | Default |
|----------|---------|
| `DATABASE_URL` | `sqlite:///./meetmind.db` |
| `CORS_ORIGINS` | `http://localhost:3000` |

**Frontend** (`frontend/.env.local`):

| Variable | Default |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` |

---

## Deployment

| Service | Component | Notes |
|---------|-----------|-------|
| [Vercel](https://vercel.com) | Frontend | Set `NEXT_PUBLIC_API_URL` to backend URL |
| [Render](https://render.com) / [Railway](https://railway.app) | Backend | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

Run seed script once after deploy: `python -m app.seed.run`

---

## Assumptions

1. Single default user — no real authentication (per assignment spec)
2. Transcription is mocked/seeded — no live speech-to-text
3. AI summaries are pre-seeded or generated via simple text heuristics on import
4. Sample audio uses a public MP3 URL for the media player demo
5. SQLite is sufficient for local/demo usage

---

## License

MIT
