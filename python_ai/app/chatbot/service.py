import json
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings
from app.core.redis_client import redis_client
from app.chatbot.schema import ChatbotRequest, ChatbotResponse

llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=settings.groq_api_key)

SYSTEM_PROMPT = """
너는 Pleegie 서비스의 친절한 챗봇 어시스턴트야.

Pleegie는 다음과 같은 서비스를 제공해:
- 냉장고 재료 관리
- 냉장고 재료 기반 레시피 추천
- 먹고 싶은 음식 검색 및 레시피 제공
- 근처 전통시장 및 재료 구매처 안내
- 유통기한 임박 재료 알림
- 장바구니 및 가계부 관리
- 시장 방문 스탬프 및 지역화폐 적립
- 신고 기능


사용자의 질문에 친절하고 간결하게 답변해줘.
Pleegie 서비스와 관련없는 질문에는 "Pleegie 서비스 관련 질문만 답변할 수 있어요." 라고 답해줘.
이전 대화 내용을 기억하고 자연스럽게 대화를 이어나가줘.
"""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{message}"),
    ]
)


def get_history(session_id: str) -> list:
    """Redis에서 대화 히스토리 조회"""
    key = f"chat:{session_id}"
    cached = redis_client.get(key)
    if cached:
        return json.loads(cached)
    return []


def save_history(session_id: str, history: list):
    """Redis에 대화 히스토리 저장(1시간)"""
    key = f"chat:{session_id}"
    redis_client.setex(key, 3600, json.dumps(history))


def build_messages(history: list) -> list:
    """히스토리를 LangChain 메시지 형식으로 변환"""
    messages = []
    for h in history:
        if h["role"] == "user":
            messages.append(HumanMessage(content=h["content"]))
        else:
            messages.append(AIMessage(content=h["content"]))
    return messages


async def chat(request: ChatbotRequest) -> ChatbotResponse:
    # Redis에서 대화 히스토리 조회
    history = get_history(request.session_id)

    # LangChain 체인 구성
    chain = prompt | llm | StrOutputParser()

    # Gemini 호출
    result = await chain.ainvoke(
        {"history": build_messages(history), "message": request.message}
    )

    # 히스토리 업데이트 후 Redis 저장
    history.append({"role": "user", "content": request.message})
    history.append({"role": "assistant", "content": result})
    save_history(request.session_id, history)

    return ChatbotResponse(message=result)
