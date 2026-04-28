import json
import httpx
from langchain_groq import ChatGroq
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

llm = ChatGroq(model="llama-3.1-8b-instant", api_key=settings.groq_api_key)

RECOMMEND_TEMPLATE = PromptTemplate(
    input_variables=["ingredients", "expiring_ingredients", "recipes"],
    template="""
너는 요리 전문가야. 사용자의 냉장고 재료를 기반으로 만들 수 있는 레시피를 최대 3개 추천해줘.

냉장고 재료: {ingredients}
유통기한 임박 재료: {expiring_ingredients}

아래 레시피 목록 중 냉장고 재료로 만들 수 있는 레시피를 추천해줘.
유통기한 임박 재료가 포함된 레시피를 우선적으로 추천해줘.
각 레시피마다 냉장고에 없는 재료도 알려줘.

중요 규칙:
1. 냉장고에 있는 재료는 절대 부족한재료에 넣지 마.
2. 부족한재료는 냉장고에 없는 재료만 써줘.
3. 재료명은 쉼표(,)로만 구분해줘. 다른 구분자 쓰지 마.
4. 재료명 사이에 공백만 있으면 안돼. 반드시 쉼표로 구분해줘.

레시피 목록:
{recipes}


반드시 아래 형식으로만 답변해. 다른 말은 하지 마.
각 레시피 사이에 반드시 --- 를 넣어줘.
제목: 레시피명
설명: 간단한 설명
재료: 재료1, 재료2, ...
부족한재료: 재료1, 재료2, ...
---
""",
)

# LLM 직접 생성용 (공공데이터 없을 때 폴백)
RECOMMEND_TEMPLATE_DIRECT = PromptTemplate(
    input_variables=["ingredients", "expiring_ingredients"],
    template="""
너는 요리 전문가야.
아래 재료들로 만들 수 있는 레시피 3개를
직접 만들어줘.

냉장고 재료: {ingredients}
유통기한 임박 재료: {expiring_ingredients}

유통기한 임박 재료를 우선 사용해줘.
재료명은 최대한 짧고 단순하게 써줘.
(예: 당근채 X → 당근 O)

반드시 아래 형식으로만 답변해.
각 레시피 사이에 --- 넣어줘.
다른 말은 하지 마.

제목: 레시피명
설명: 간단한 설명
재료: 재료1, 재료2, ...
부족한재료: 냉장고에 없는 재료1, 재료2, ...
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

중요: 재료명은 아래 목록에 있는 이름 그대로 써줘.
      임의로 바꾸지 마.

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
    all_recipes = []

    # 600개 로드
    for start in range(1, 601, 100):
        end = start + 99
        url = (
            f"http://openapi.foodsafetykorea.go.kr/api/"
            f"{settings.recipe_api_key}"
            f"/COOKRCP01/json/{start}/{end}"
        )
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                if not response.text:
                    continue
                data = response.json()
            recipes = data.get("COOKRCP01", {}).get("row", [])
            all_recipes.extend(
                [
                    {
                        "title": r.get("RCP_NM"),
                        "ingredients": r.get("RCP_PARTS_DTLS"),
                        "image_url": r.get("ATT_FILE_NO_MAIN"),
                        "category": r.get("RCP_PAT2"),
                    }
                    for r in recipes
                ]
            )
        except Exception as e:
            print(f"API 오류 ({start}~{end}):", e)
            continue

    # 재료 키워드로 필터링
    keywords = query.split()
    filtered = [
        r
        for r in all_recipes
        if r["ingredients"] and any(k in r["ingredients"] for k in keywords)
    ]

    # 필터링 결과 너무 적으면 전체에서 50개
    if len(filtered) < 10:
        filtered = all_recipes[:50]

    print(f"필터링된 레시피: {len(filtered)}개")
    return filtered


def calculate_match_score(
    recipe_ingredients: list[str], fridge_ingredients: list[str]
) -> float:
    """냉장고 재료 매칭 점수 계산 (0.0~1.0)"""
    if not recipe_ingredients or not fridge_ingredients:
        return 0.0
    # 레시피 재료 중 냉장고에 있는 것 개수
    matched = sum(
        1
        for ing in recipe_ingredients
        if any(fridge in ing or ing in fridge for fridge in fridge_ingredients)
    )
    score = round(matched / len(recipe_ingredients), 2)

    # ✅ 로그 추가
    print(f"레시피 재료: {recipe_ingredients}")
    print(f"냉장고 재료: {fridge_ingredients}")
    print(f"매칭 수: {matched}")
    print(f"총 재료 수: {len(recipe_ingredients)}")
    print(f"매칭률: {score}")

    return score


def has_expiring_ingredient(
    recipe_ingredients: list[str], expiring_ingredients: list[str]
) -> bool:
    """레시피에 유통기한 임박 재료가 포함되어 있는지 확인"""
    return any(ei in " ".join(recipe_ingredients) for ei in expiring_ingredients)


def parse_recipes(
    text: str, fridge_ingredients: list[str], expiring_ingredients: list[str]
) -> list[RecipeItem]:
    results = []
    # --- 로 분리
    blocks = text.strip().split("---")

    # --- 없으면 "제목:" 으로 분리
    if len(blocks) <= 1:
        import re

        blocks = re.split(r"\n(?=제목:)", text.strip())

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        lines = {
            line.split(":")[0].strip(): line.split(":", 1)[1].strip()
            for line in block.splitlines()
            if ":" in line
        }

        # 제목 없으면 스킵
        if not lines.get("제목"):
            continue

        # 재료 없으면 스킵
        if not lines.get("재료"):
            continue

        recipe_ingredients = [
            i.strip() for i in lines.get("재료", "").split(",") if i.strip()
        ]
        missing_ingredients = [
            i.strip() for i in lines.get("부족한재료", "").split(",") if i.strip()
        ]

        # 부족한재료를 재료 목록 기반으로 재계산, LLM이 잘못 계산한 경우 보정
        recalculated_missing = [
            ing
            for ing in recipe_ingredients
            if not any(fridge in ing or ing in fridge for fridge in fridge_ingredients)
        ]

        ingredients_text = " ".join(recipe_ingredients)

        match_score = calculate_match_score(recipe_ingredients, fridge_ingredients)
        has_expiring = has_expiring_ingredient(ingredients_text, expiring_ingredients)

        results.append(
            RecipeItem(
                title=lines.get("제목", ""),
                description=lines.get("설명", ""),
                ingredients=recipe_ingredients,
                missing_ingredients=recalculated_missing,  # ← LLM 부족한재료 대신 재계산한 값 사용
                match_score=match_score,
                has_expiring=has_expiring,
            )
        )

        # 유통기한 임박 재료 포함 레시피 상단정렬 -> 매칭 점수 높은 순 정렬
    results.sort(key=lambda x: (x.has_expiring, x.match_score), reverse=True)
    return results


async def recommend_by_fridge(request: RecipeRecommendRequest) -> RecipeResponse:
    # Redis 캐시 확인
    # cache_key = f"recommend:{':'.join(sorted(request.ingredients))}"
    # cached = redis_client.get(cache_key)
    # if cached:
    #     print("캐시 히트!!")
    #     recipes = [RecipeItem(**r) for r in json.loads(cached)]
    #     return RecipeResponse(recipes=recipes)

    # 공공 API에서 레시피 조회
    recipes_data = await fetch_recipes_from_api(" ".join(request.ingredients))

    # 필터링 결과 확인
    print(f"필터링된 레시피: {len(recipes_data)}개")

    top_recipes = recipes_data[:10]

    # 레시피 없으면 LLM 직접 생성으로 폴백
    if not top_recipes:
        print("공공데이터 레시피 없음 → LLM 직접 생성")
        chain = RECOMMEND_TEMPLATE_DIRECT | llm | StrOutputParser()
        result = await chain.ainvoke(
            {
                "ingredients": ", ".join(request.ingredients),
                "expiring_ingredients": (
                    ", ".join(request.expiring_ingredients)
                    if request.expiring_ingredients
                    else "없음"
                ),
            }
        )
    else:
        recipe_text = "\n".join(
            [f"- {r['title']}: {r['ingredients']}" for r in top_recipes]
        )
        chain = RECOMMEND_TEMPLATE | llm | StrOutputParser()
        result = await chain.ainvoke(
            {
                "ingredients": ", ".join(request.ingredients),
                "expiring_ingredients": (
                    ", ".join(request.expiring_ingredients)
                    if request.expiring_ingredients
                    else "없음"
                ),
                "recipes": recipe_text,
            }
        )

    print("=== LLM 응답 ===")
    print(result)
    print("================")

    parsed = parse_recipes(result, request.ingredients, request.expiring_ingredients)
    print("파싱된 레시피 수:", len(parsed))

    return RecipeResponse(recipes=parsed)


async def search_recipe(request: RecipeSearchRequest) -> RecipeResponse:
    # Redis 캐시 확인
    cache_key = f"search:{request.query}"
    cached = redis_client.get(cache_key)

    if cached:
        print("캐시 히트!")
        recipes = [RecipeItem(**r) for r in json.loads(cached)]
        return RecipeResponse(recipes=recipes)

    # 공공 API에서 레시피 조회
    recipes_data = await fetch_recipes_from_api(request.query)
    top_recipes = recipes_data[:3]

    recipe_text = "\n".join(
        [f"- {r['title']}: {r['ingredients']}" for r in top_recipes]
    )

    chain = SEARCH_TEMPLATE | llm | StrOutputParser()
    result = await chain.ainvoke(
        {"query": request.query, "ingredients": "없음", "recipes": recipe_text}
    )

    parsed = parse_recipes(result, [], [])

    # Redis에 캐시 저장(1시간)
    redis_client.setex(cache_key, 3600, json.dumps([r.model_dump() for r in parsed]))

    return RecipeResponse(recipes=parsed)
