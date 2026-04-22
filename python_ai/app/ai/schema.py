from pydantic import BaseModel


class AiRequest(BaseModel):
    message: str


class AiResponse(BaseModel):
    intent: str  # RECIPE_RECOMMEND / RECIPE_SEARCH / CHATBOT
    message: str
    data: dict | None = None
