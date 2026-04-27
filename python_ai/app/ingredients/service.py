import json
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings
from app.ingredients.schema import (
    IngredientExtractRequest,
    IngredientExtractResponse,
    IngredientItem,
    IngredientInfoRequest,
    IngredientInfoResponse,
    IngredientInfo,
)

llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=settings.groq_api_key)

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


INFO_TEMPLATE = PromptTemplate(
    input_variables=["ingredients"],
    template="""
너는 식재료 전문가야. 아래 재료들의 카테고리와 일반적인 냉장 보관 유통기한(일 단위)을 알려줘.

카테고리는 반드시 아래 기준으로만 분류해줘.
- 채소 : 당근, 양파, 대파, 마늘, 시금치, 배추 등 채소류
- 과일 : 사과, 바나나, 딸기 등 과일류
- 육류 : 소고기, 돼지고기, 닭고기 등 육류
- 해산물 : 생선, 새우, 오징어, 조개 등 해산물류
- 유제품 : 우유, 치즈, 버터, 요거트 등 유제품
- 단백질 : 계란, 두부, 콩, 어묵 등 단백질 식품 (유제품 제외)
- 곡물 : 쌀, 밀가루, 빵, 면류 등 곡물류
- 양념 : 간장, 된장, 고추장, 소금, 설탕 등 양념류
- 기타 : 위 카테고리에 해당하지 않는 식재료

반드시 JSON 배열 형식으로만 반환해. 다른 말은 하지 마. 마크다운 코드블록도 쓰지 마.

예시 입력: ["계란", "우유", "당근"]
예시 출력: [{{"name":"계란","category":"단백질","defaultExp":21}},{{"name":"우유","category":"유제품","defaultExp":7}},{{"name":"당근","category":"채소","defaultExp":14}}]

입력: {ingredients}
""",
)


async def get_ingredient_info(request: IngredientInfoRequest) -> IngredientInfoResponse:
    chain = INFO_TEMPLATE | llm | StrOutputParser()
    result = await chain.ainvoke({"ingredients": request.ingredients})

    try:
        raw = result.strip()
        parsed = json.loads(raw)
        ingredients = [IngredientInfo(**item) for item in parsed]
    except Exception:
        ingredients = []

    return IngredientInfoResponse(ingredients=ingredients)
