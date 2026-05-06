from fastapi import APIRouter
from app.ai.schema import AiRequest, AiResponse, MarketGuideResponse
from app.ai.service import detect_intent, market_guide

router = APIRouter()


@router.post("", response_model=AiResponse)
async def ai_intent(request: AiRequest):
    return await detect_intent(request)


@router.post("/market-guide", response_model=MarketGuideResponse)
async def market_guide_handler(request: AiRequest):
    return await market_guide(request)
