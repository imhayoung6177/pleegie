from pydantic import BaseModel


class ChatbotRequest(BaseModel):
    message: str
    session_id: str  # userId 기반 세션 ID


class ChatbotResponse(BaseModel):
    message: str
