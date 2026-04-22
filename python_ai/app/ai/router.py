from fastapi import APIRouter
from app.ai.schema import AiRequest, AiResponse
from app.ai.service import detect_intent

router = APIRouter()


@router.post("", response_model=AiResponse)
async def ai_intent(request: AiRequest):
    return await detect_intent(request)
