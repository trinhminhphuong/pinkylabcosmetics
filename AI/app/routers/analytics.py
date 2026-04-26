from fastapi import APIRouter, Query

from app.schemas import AnalyticsSummary
from app.services.analytics_service import analytics_service


router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def analytics_summary(period_days: int = Query(default=30, ge=1, le=365)) -> AnalyticsSummary:
    return await analytics_service.summary(period_days)
