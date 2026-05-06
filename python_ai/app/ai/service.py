from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings
from app.ai.schema import AiRequest, AiResponse
from app.ai.schema import AiRequest, AiResponse, MarketGuideResponse

llm = ChatGroq(model="llama-3.1-8b-instant", api_key=settings.groq_api_key)

INTENT_PROMPT = PromptTemplate(
    input_variables=["message"],
    template="""
너는 사용자의 메시지를 분석해서 의도를 파악하는 AI야.
아래 4가지 intent 중 하나만 반환해.

- RECIPE_RECOMMEND : 냉장고 재료 기반으로 레시피를 추천해달라는 의도 (예: "레시피 추천해줘", "뭐 만들어 먹지")
- RECIPE_SEARCH : 특정 음식이나 요리를 검색하려는 의도 (예: "김치찌개 레시피", "파스타 만드는 법")
- MARKET_GUIDE : 근처 시장 안내, 재료 구매처 문의 등 시장 관련 의도
- CHATBOT : 신고, 문의, 일반 대화 등 나머지 모든 의도

반드시 intent 값만 한 단어로 반환해. 다른 말은 하지 마.

사용자 메시지: {message}
""",
)


async def detect_intent(request: AiRequest) -> AiResponse:
    chain = INTENT_PROMPT | llm | StrOutputParser()
    result = await chain.ainvoke({"message": request.message})
    intent = result.strip()

    if intent not in ["RECIPE_RECOMMEND", "RECIPE_SEARCH", "MARKET_GUIDE", "CHATBOT"]:
        intent = "CHATBOT"

    return AiResponse(intent=intent, message=request.message)


MARKET_GUIDE_PROMPT = PromptTemplate(
    input_variables=["message"],
    template="""
너는 한국 전통시장 전문 안내원이야. 반드시 한국어로만 답변해.

사용자 질문: {message}

시장 관련 정보, 재료 구매처, 전통시장 이용 방법 등을 친절하게 안내해줘.
답변은 3-4문장으로 간결하게 해줘.
""",
)


async def market_guide(request: AiRequest) -> MarketGuideResponse:
    chain = MARKET_GUIDE_PROMPT | llm | StrOutputParser()
    result = await chain.ainvoke({"message": request.message})
    return MarketGuideResponse(message=result.strip())
