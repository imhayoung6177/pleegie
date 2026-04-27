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

llm = ChatGroq(model="llama-3.1-8b-instant", api_key=settings.groq_api_key)

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

카테고리 종류 : 채소, 과일, 육류, 해산물, 유제품, 단백질, 곡물, 양념, 기타

반드시 JSON 배열 형식으로만 반환해. 다른말은 하지마. 마크다운 코드블록도 쓰지 마.

예시 입력 : ["당근", "대파"]
예시 출력: [{{"name":"당근","category": "채소", "defaultExp": 7}},{{"name": "대파", "category": "채소", "defaultExp": 7}}]

입력: {ingredients}
""",
)


# async def get_ingredient_info(request: IngredientInfoRequest) -> IngredientInfoResponse:
#     chain = INFO_TEMPLATE | llm | StrOutputParser()
#     result = await chain.ainvoke({"ingredients": request.ingredients})

#     try:
#         raw = result.strip()
#         parsed = json.loads(raw)
#         ingredients = [IngredientInfo(**item) for item in parsed]
#     except Exception:
#         ingredients = []

#     return IngredientInfoResponse(ingredients=ingredients)


async def get_ingredient_info(request: IngredientInfoRequest) -> IngredientInfoResponse:
    chain = INFO_TEMPLATE | llm | StrOutputParser()
    result = await chain.ainvoke({"ingredients": request.ingredients})

    print("LLM 응답:", result)  # 로그 추가

    try:
        raw = result.strip()
        parsed = json.loads(raw)
        ingredients = [IngredientInfo(**item) for item in parsed]
    except Exception as e:
        print("파싱 에러:", e)  # 로그 추가
        ingredients = []

    return IngredientInfoResponse(ingredients=ingredients)
