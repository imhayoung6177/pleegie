import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings
from app.ingredients.schema import (
    IngredientExtractRequest,
    IngredientExtractResponse,
    IngredientItem,
)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", google_api_key=settings.gemini_api_key
)

EXTRACT_TEMPLATE = PromptTemplate(
    input_variables=["message"],
    template="""
너는 사용자의 자연어 입력에서 식재료 정보를 추출하는 AI야.

아래 입력에서 재료명, 수량, 단위를 추출해줘.
수량이 없으면 1, 단위가 없으면 "개"로 기본값을 설정해줘.
단위는 반드시 한국어로 반환해줘. (개, 모, kg, g, L, ml, 묶음, 봉지 등)

반드시 JSON 배열 형식으로만 반환해. 다른 말은 하지 마. 마크다운 코드블록도 쓰지 마.

예시 입력: 계란 2개랑 두부 반모 있어
예시 출력: [{{"name": "계란", "quantity": 2, "unit": "개"}}, {{"name": "두부", "quantity": 0.5, "unit": "모"}}]

입력: {message}
""",
)


async def extract_ingredients(
    request: IngredientExtractRequest,
) -> IngredientExtractResponse:
    chain = EXTRACT_TEMPLATE | llm | StrOutputParser()
    result = await chain.ainvoke({"message": request.message})

    try:
        raw = result.strip()
        parsed = json.loads(raw)
        ingredients = [IngredientItem(**item) for item in parsed]
    except Exception:
        ingredients = []

    return IngredientExtractResponse(ingredients=ingredients)
