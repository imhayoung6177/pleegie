from google import genai
from app.core.config import settings
from app.chatbot.schema import ChatbotRequest, ChatbotResponse

client = genai.Client(api_key=settings.gemini_api_key)

CHATBOT_PROMPT = """
너는 Pleegie 서비스의 친절한 챗봇 어시스턴트야.
Pleegie는 사용자의 냉장고 재료를 관리하고 레시피를 추천해주며,
근처 시장과 연계해주는 서비스야.

사용자의 질문에 친절하고 간결하게 답변해줘.
서비스와 관련없는 질문에는 "Pleegie 서비스 관련 질문만 답변할 수 있어요." 라고 답해줘.

사용자 메시지: {message}
"""


async def chat(request: ChatbotRequest) -> ChatbotResponse:
    prompt = CHATBOT_PROMPT.format(message=request.message)
    response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
    return ChatbotResponse(message=response.text.strip())
