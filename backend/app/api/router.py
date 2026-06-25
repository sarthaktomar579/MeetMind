from fastapi import APIRouter

from app.api.routes import meetings

api_router = APIRouter()
api_router.include_router(meetings.router)
