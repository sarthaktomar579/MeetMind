# MeetMind

Meeting intelligence workspace — a Fireflies.ai-inspired platform for browsing meeting transcripts, AI summaries, and action items.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend  | FastAPI, SQLAlchemy 2, Pydantic v2  |
| Database | SQLite                              |

## Project Structure

```
MeetMind/
├── frontend/     # Next.js application
├── backend/      # FastAPI REST API
└── README.md
```

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python -m app.seed.run
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

App: http://localhost:3000

## Environment Variables

**Backend** (`backend/.env`):

| Variable       | Default                          |
|----------------|----------------------------------|
| DATABASE_URL   | sqlite:///./meetmind.db          |
| CORS_ORIGINS   | http://localhost:3000            |

**Frontend** (`frontend/.env.local`):

| Variable              | Default                  |
|-----------------------|--------------------------|
| NEXT_PUBLIC_API_URL   | http://localhost:8000    |

## License

MIT
