from fastapi import APIRouter

from app.services.catalog_service import catalog_service


router = APIRouter(prefix="/api/catalog", tags=["catalog"])


@router.post("/sync")
async def sync_catalog() -> dict:
    return await catalog_service.sync_products()
