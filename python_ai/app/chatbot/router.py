from fastapi import APIRouter
from app.chatbot.schema import ChatbotRequest, ChatbotResponse
from app.chatbot.service import chat

router = APIRouter()


@router.post("", response_model=ChatbotResponse)
async def chatbot(request: ChatbotRequest):
    return await chat(request)
