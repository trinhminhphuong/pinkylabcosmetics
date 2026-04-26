from fastapi import APIRouter

from app.schemas import EventCreate, EventResponse
from app.services.event_service import event_service


router = APIRouter(prefix="/api/events", tags=["events"])


@router.post("", response_model=EventResponse)
def track_event(event: EventCreate) -> EventResponse:
    event_service.record(event)
    return EventResponse()
