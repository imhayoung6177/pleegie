import json
import httpx
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings
from app.core.redis_client import redis_client
from app.recipe.schema import (
    RecipeRecommendRequest,
    RecipeSearchRequest,
    RecipeResponse,
    RecipeItem,
)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-lite", google_api_key=settings.gemini_api_key
)

RECOMMEND_TEMPLATE = PromptTemplate(
    input_variables=["ingredients", "expiring_ingredients", "recipes"],
    template="""
너는 요리 전문가야. 사용자의 냉장고 재료를 기반으로 만들 수 있는 레시피를 추천해줘.

냉장고 재료: {ingredients}
유통기한 임박 재료: {expiring_ingredients}

아래 레시피 목록 중 냉장고 재료로 만들 수 있는 레시피를 추천해줘.
유통기한 임박 재료가 포함된 레시피를 우선적으로 추천해줘.
각 레시피마다 냉장고에 없는 재료도 알려줘.

레시피 목록:
{recipes}

반드시 아래 형식으로만 답변해. 다른 말은 하지 마.
제목: 레시피명
설명: 간단한 설명
재료: 재료1, 재료2, ...
부족한재료: 재료1, 재료2, ...
---
""",
)

SEARCH_TEMPLATE = PromptTemplate(
    input_variables=["query", "ingredients", "recipes"],
    template="""
너는 요리 전문가야. 사용자가 먹고싶은 음식에 맞는 레시피를 추천해줘.

먹고싶은 음식: {query}
사용자 냉장고 재료: {ingredients}

아래 레시피 목록 중 관련된 레시피를 추천해줘.
각 레시피마다 냉장고에 없는 재료도 알려줘.

레시피 목록:
{recipes}

반드시 아래 형식으로만 답변해. 다른 말은 하지 마.
제목: 레시피명
설명: 간단한 설명
재료: 재료1, 재료2, ...
부족한재료: 재료1, 재료2, ...
---
""",
)


async def fetch_recipes_from_api(query: str) -> list[dict]:
    """공공 API에서 레시피 검색"""
    url = f"http://openapi.foodsafetykorea.go.kr/api/{settings.recipe_api_key}/COOKRCP01/json/1/100"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()

    recipes = data.get("COOKRCP01", {}).get("row", [])
    return [
        {
            "title": r.get("RCP_NM"),
            "ingredients": r.get("RCP_PARTS_DTLS"),
            "image_url": r.get("ATT_FILE_NO_MAIN"),
            "category": r.get("RCP_PAT2"),
        }
        for r in recipes
    ]


def calculate_match_score(
    recipe_ingredients: str, fridge_ingredients: list[str]
) -> float:
    """냉장고 재료 매칭 점수 계산 (0.0~1.0)"""
    if not recipe_ingredients or not fridge_ingredients:
        return 0.0
    matched = sum(1 for fi in fridge_ingredients if fi in recipe_ingredients)
    return round(matched / len(fridge_ingredients), 2)


def has_expiring_ingredient(
    recipe_ingredients: list[str], expiring_ingredients: list[str]
) -> bool:
    """레시피에 유통기한 임박 재료가 포함되어 있는지 확인"""
    return any(ei in " ".join(recipe_ingredients) for ei in expiring_ingredients)


def parse_recipes(
    text: str, fridge_ingredients: list[str], expiring_ingredients: list[str]
) -> list[RecipeItem]:
    results = []
    blocks = text.strip().split("---")

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        lines = {
            line.split(":")[0].strip(): line.split(":", 1)[1].strip()
            for line in block.splitlines()
            if ":" in line
        }

        recipe_ingredients = [i.strip() for i in lines.get("재료", "").split(",")]
        missing_ingredients = [
            i.strip() for i in lines.get("부족한재료", "").split(",")
        ]
        ingredients_text = " ".join(recipe_ingredients)

        match_score = calculate_match_score(ingredients_text, fridge_ingredients)
        has_expiring = has_expiring_ingredient(ingredients_text, expiring_ingredients)

        results.append(
            RecipeItem(
                title=lines.get("제목", ""),
                description=lines.get("설명", ""),
                ingredients=recipe_ingredients,
                missing_ingredients=missing_ingredients,
                match_score=match_score,
                has_expiring=has_expiring,
            )
        )

        # 유통기한 임박 재료 포함 레시피 상단정렬 -> 매칭 점수 높은 순 정렬
    results.sort(key=lambda x: (x.has_expiring, x.match_score), reverse=True)
    return results


# async def recommend_by_fridge(request: RecipeRecommendRequest) -> RecipeResponse:
#     # Redis 캐시 확인
#     cache_key = f"recommend:{':'.join(sorted(request.ingredients))}"
#     cached = redis_client.get(cache_key)
#     if cached:
#         print("캐시 히트!!")
#         recipes = [RecipeItem(**r) for r in json.loads(cached)]
#         return RecipeResponse(recipes=recipes)

#     # 공공 API에서 레시피 조회
#     recipes_data = await fetch_recipes_from_api(" ".join(request.ingredients))

#     recipe_text = "\n".join(
#         [f"- {r['title']}: {r['ingredients']}" for r in recipes_data]
#     )

#     chain = RECOMMEND_TEMPLATE | llm | StrOutputParser()
#     result = await chain.ainvoke(
#         {
#             "ingredients": ", ".join(request.ingredients),
#             "expiring_ingredients": (
#                 ", ".join(request.expiring_ingredients)
#                 if request.expiring_ingredients
#                 else "없음"
#             ),
#             "recipes": recipe_text,
#         }
#     )

#     parsed = parse_recipes(result, request.ingredients, request.expiring_ingredients)

#     # Redis에 캐시 저장(1시간)
#     redis_client.setex(cache_key, 3600, json.dumps([r.model_dump() for r in parsed]))

#     return RecipeResponse(recipes=parsed)


async def recommend_by_fridge(request: RecipeRecommendRequest) -> RecipeResponse:

    # 임시 Mock 데이터 (테스트용)
    mock_recipes = [
        RecipeItem(
            title="당근 달걀볶음",
            description="냉장고 재료로 만드는 간단한 볶음 요리",
            ingredients=["당근", "계란", "간장", "참기름"],
            missing_ingredients=["간장", "참기름"],
            match_score=0.8,
            has_expiring=True,
        ),
        RecipeItem(
            title="대파 계란국",
            description="든든한 한 그릇 요리",
            ingredients=["대파", "계란", "소금", "물"],
            missing_ingredients=["소금"],
            match_score=0.7,
            has_expiring=False,
        ),
        RecipeItem(
            title="당근 라페",
            description="프랑스식 당근 샐러드",
            ingredients=["당근", "레몬즙", "올리브오일"],
            missing_ingredients=["레몬즙", "올리브오일"],
            match_score=0.6,
            has_expiring=True,
        ),
    ]
    return RecipeResponse(recipes=mock_recipes)


# async def search_recipe(request: RecipeSearchRequest) -> RecipeResponse:
#     # Redis 캐시 확인
#     cache_key = f"search:{request.query}"
#     cached = redis_client.get(cache_key)

#     if cached:
#         print("캐시 히트!")
#         recipes = [RecipeItem(**r) for r in json.loads(cached)]
#         return RecipeResponse(recipes=recipes)

#     # 공공 API에서 레시피 조회
#     recipes_data = await fetch_recipes_from_api(request.query)

#     recipe_text = "\n".join(
#         [f"- {r['title']}: {r['ingredients']}" for r in recipes_data]
#     )

#     chain = SEARCH_TEMPLATE | llm | StrOutputParser()
#     result = await chain.ainvoke(
#         {"query": request.query, "ingredients": "없음", "recipes": recipe_text}
#     )

#     parsed = parse_recipes(result, [], [])

#     # Redis에 캐시 저장(1시간)
#     redis_client.setex(cache_key, 3600, json.dumps([r.model_dump() for r in parsed]))

#     return RecipeResponse(recipes=parsed)


async def search_recipe(request: RecipeSearchRequest) -> RecipeResponse:

    # 임시 Mock 데이터 (테스트용)
    mock_recipes = [
        RecipeItem(
            title=f"{request.query} 기본 레시피",
            description=f"{request.query} 만드는 방법",
            ingredients=["재료1", "재료2", "재료3"],
            missing_ingredients=["재료2", "재료3"],
            match_score=0.9,
            has_expiring=False,
        ),
        RecipeItem(
            title=f"{request.query} 응용 레시피",
            description=f"{request.query} 색다르게 만들기",
            ingredients=["재료1", "재료4", "재료5"],
            missing_ingredients=["재료4", "재료5"],
            match_score=0.7,
            has_expiring=False,
        ),
    ]
    return RecipeResponse(recipes=mock_recipes)
