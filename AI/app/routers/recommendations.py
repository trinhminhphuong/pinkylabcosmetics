from fastapi import APIRouter

from app.schemas import RecommendationRequest, RecommendationResponse
from app.services.recommendation_service import recommendation_service


router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.post("", response_model=RecommendationResponse)
async def recommend(request: RecommendationRequest) -> RecommendationResponse:
    return await recommendation_service.recommend(request)
