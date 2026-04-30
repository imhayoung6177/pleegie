import json
import httpx
import re
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

RECOMMEND_TEMPLATE_DIRECT = PromptTemplate(
    input_variables=["ingredients", "expiring_ingredients"],
    template="""
너는 한국 요리 전문가야. 반드시 한국어로만 답변해. 영어 단어는 절대 사용하지 마.

아래 재료로 만들 수 있는 한국 요리 3가지를 직접 만들어줘.

냉장고 재료: {ingredients}
유통기한 임박 재료: {expiring_ingredients}

규칙:
1. 유통기한 임박 재료를 우선 사용해줘.
2. 재료명은 짧고 자연스러운 한국어로 써줘. (예: 당근채 X → 당근 O)
3. 재료는 쉼표(,)로만 구분해줘.
4. 요리법은 번호를 붙여서 한 줄씩 써줘.
5. 부족한재료는 냉장고에 없는 재료만 써줘.
6. 재료에 소스가 있다면 소스만드는법도 써줘. 형식: 소스만드는법: 1. 첫번째 단계. 2. 두번째 단계.

반드시 아래 형식으로만 답변해. 다른 말은 하지 마.
각 레시피 사이에 반드시 --- 를 넣어줘.

제목: 레시피명
설명: 간단한 설명
재료: 재료1, 재료2, 재료3
부족한재료: 재료1, 재료2
소스만드는법: 1. 첫번째 단계. (소스가 없으면 이 줄 생략)
요리법: 1. 첫번째 단계. 2. 두번째 단계. 3. 세번째 단계.
---
""",
)

SEARCH_TEMPLATE_DIRECT = PromptTemplate(
    input_variables=["query"],
    template="""
너는 한국 요리 전문가야. 반드시 한국어로만 답변해. 영어 단어는 절대 사용하지 마.

"{query}" 요리의 레시피 3가지를 직접 만들어줘.
정확히 일치하는 레시피가 없다면 비슷한 요리로 만들어줘.

규칙:
1. 재료명은 짧고 자연스러운 한국어로 써줘.
2. 재료는 쉼표(,)로만 구분해줘.
3. 요리법은 번호를 붙여서 한 줄씩 써줘.
4. 재료에 소스가 있다면 소스만드는법도 써줘. 형식: 소스만드는법: 1. 첫번째 단계. 2. 두번째 단계.

반드시 아래 형식으로만 답변해. 다른 말은 하지 마.
각 레시피 사이에 반드시 --- 를 넣어줘.

제목: 레시피명
설명: 간단한 설명
재료: 재료1, 재료2, 재료3
부족한재료:
소스만드는법: 1. 첫번째 단계. (소스가 없으면 이 줄 생략)
요리법: 1. 첫번째 단계. 2. 두번째 단계. 3. 세번째 단계.
---
""",
)


def extract_cooking_steps_from_api(r: dict) -> str:
    """공공데이터 MANUAL01~MANUAL20 필드에서 요리법 추출- 번호 없이 리스트로 반환"""
    steps = []
    for i in range(1, 21):
        key = f"MANUAL{i:02d}"
        step = r.get(key, "").strip()
        if step:
            step = re.sub(r"^\d+[\.\)]\s*", "", step)  # 번호 제거
            steps.append(step)
    return steps


def extract_sauce_steps(ingredients: list[str], cooking_steps: str) -> str:
    """재료에 소스/양념장/양념이 포함된 경우 요리법에서 관련 단계 추출"""
    has_sauce = any(
        any(keyword in ing for keyword in SAUCE_KEYWORDS) for ing in ingredients
    )
    if not has_sauce:
        return []

    sauce_steps = [
        step
        for step in cooking_steps
        if any(keyword in step for keyword in SAUCE_KEYWORDS)
    ]
    return sauce_steps


async def fetch_recipes_from_api(query: str) -> list[dict]:
    """냉장고 재료 기반 공공 API 레시피 조회"""
    all_recipes = []

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
                        "cooking_steps": extract_cooking_steps_from_api(r),  # ← 추가
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

    print(f"API 레시피 필터링 결과: {len(filtered)}개")
    return filtered


async def fetch_recipes_by_name(query: str) -> list[dict]:
    """레시피 이름으로 공공 API 검색"""
    all_recipes = []
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
                        "cooking_steps": extract_cooking_steps_from_api(r),  # ← 추가
                    }
                    for r in recipes
                ]
            )
        except Exception as e:
            print(f"API 오류: {e}")
            continue

    exact = [r for r in all_recipes if r["title"] and r["title"] == query]
    contains = [
        r for r in all_recipes if r["title"] and query in r["title"] and r not in exact
    ]
    ingredient_match = [
        r
        for r in all_recipes
        if r["ingredients"]
        and query in r["ingredients"]
        and r not in exact
        and r not in contains
    ]

    filtered = exact + contains + ingredient_match
    print(f"이름 검색 결과: {len(filtered)}개")
    return filtered


SAUCE_KEYWORDS = ["소스", "양념장", "양념"]


def is_ingredient_available(ing: str, fridge_ingredients: list[str]) -> bool:
    """냉장고 재료와 매칭 여부 판단"""
    # 소스/양념장/양념이 포함된 재료는 냉장고에 없는 것으로 판단
    if any(keyword in ing for keyword in SAUCE_KEYWORDS):
        return False
    return any(fridge in ing or ing in fridge for fridge in fridge_ingredients)


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
        if is_ingredient_available(ing, fridge_ingredients)  # ← 변경
    )
    return round(matched / len(recipe_ingredients), 2)


def has_expiring_ingredient(
    recipe_ingredients_text: str, expiring_ingredients: list[str]
) -> bool:
    """레시피에 유통기한 임박 재료가 포함되어 있는지 확인"""
    return any(ei in recipe_ingredients_text for ei in expiring_ingredients)


def parse_api_recipes(
    recipes_data: list[dict],
    fridge_ingredients: list[str],
    expiring_ingredients: list[str],
) -> list[RecipeItem]:
    """공공 API 레시피를 RecipeItem으로 변환"""
    results = []
    for r in recipes_data:
        title = r.get("title", "")
        ingredients_raw = r.get("ingredients", "") or ""
        cooking_steps = r.get("cooking_steps", [])  # ← API에서 가져온 요리법

        recipe_ingredients = [
            i.strip() for i in re.split(r"[,\n]", ingredients_raw) if i.strip()
        ]

        recalculated_missing = [
            ing
            for ing in recipe_ingredients
            if not is_ingredient_available(ing, fridge_ingredients)
        ]

        ingredients_text = " ".join(recipe_ingredients)
        match_score = calculate_match_score(recipe_ingredients, fridge_ingredients)
        has_expiring = has_expiring_ingredient(ingredients_text, expiring_ingredients)

        # 소스 관련 단계 추출
        sauce_steps = extract_sauce_steps(recipe_ingredients, cooking_steps)

        results.append(
            RecipeItem(
                title=title,
                description="",
                ingredients=recipe_ingredients,
                missing_ingredients=recalculated_missing,
                match_score=match_score,
                has_expiring=has_expiring,
                cooking_steps=cooking_steps,
                sauce_steps=sauce_steps,  # ← schema에 필드 추가 필요
            )
        )

    results.sort(key=lambda x: (x.has_expiring, x.match_score), reverse=True)
    return results


def parse_llm_recipes(
    text: str, fridge_ingredients: list[str], expiring_ingredients: list[str]
) -> list[RecipeItem]:
    """LLM 생성 텍스트를 RecipeItem으로 변환"""
    results = []
    blocks = text.strip().split("---")

    # --- 없으면 "제목:" 으로 분리
    if len(blocks) <= 1:
        blocks = re.split(r"\n(?=제목:)", text.strip())

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        # 요리법 추출
        cooking_steps = []
        cooking_match = re.search(r"요리법[:：]\s*([\s\S]*?)(?=소스만드는법|$)", block)
        if cooking_match:
            raw_steps = cooking_match.group(1).strip()
            # "1. 단계 2. 단계" 형태를 번호 기준으로 분리
            split_steps = re.split(r"\d+\.\s*", raw_steps)
            cooking_steps = [s.strip() for s in split_steps if s.strip()]

        # 소스만드는법 추출 -> 리스트로
        sauce_steps = []
        sauce_match = re.search(r"소스만드는법[:：]\s*([\s\S]*?)(?=\n요리법|$)", block)
        if sauce_match:
            raw_sauce = sauce_match.group(1).strip()
            split_sauce = re.split(r"\d+\.\s*", raw_sauce)
            sauce_steps = [s.strip() for s in split_sauce if s.strip()]

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

        # 부족한재료를 재료 목록 기반으로 재계산, LLM이 잘못 계산한 경우 보정
        recalculated_missing = [
            ing
            for ing in recipe_ingredients
            if not is_ingredient_available(ing, fridge_ingredients)
        ]

        ingredients_text = " ".join(recipe_ingredients)
        match_score = calculate_match_score(recipe_ingredients, fridge_ingredients)
        has_expiring = has_expiring_ingredient(ingredients_text, expiring_ingredients)

        results.append(
            RecipeItem(
                title=f"[AI] {lines.get('제목', '')}",
                description=lines.get("설명", ""),
                ingredients=recipe_ingredients,
                missing_ingredients=recalculated_missing,
                match_score=match_score,
                has_expiring=has_expiring,
                cooking_steps=cooking_steps,
                sauce_steps=sauce_steps,
            )
        )

    return results


async def recommend_by_fridge(request: RecipeRecommendRequest) -> RecipeResponse:
    # 1. 공공 API 레시피
    recipes_data = await fetch_recipes_from_api(" ".join(request.ingredients))
    api_recipes = parse_api_recipes(
        recipes_data, request.ingredients, request.expiring_ingredients or []
    )
    print(f"API 레시피: {len(api_recipes)}개")

    # 2. LLM 레시피 3개 생성
    chain = RECOMMEND_TEMPLATE_DIRECT | llm | StrOutputParser()
    llm_result = await chain.ainvoke(
        {
            "ingredients": ", ".join(request.ingredients),
            "expiring_ingredients": (
                ", ".join(request.expiring_ingredients)
                if request.expiring_ingredients
                else "없음"
            ),
        }
    )
    llm_recipes = parse_llm_recipes(
        llm_result, request.ingredients, request.expiring_ingredients or []
    )
    print(f"LLM 레시피: {len(llm_recipes)}개")

    # 3. API 먼저 + LLM 뒤에
    all_recipes = api_recipes + llm_recipes
    return RecipeResponse(recipes=all_recipes)


async def search_recipe(request: RecipeSearchRequest) -> RecipeResponse:
    cache_key = f"search:{request.query}"
    cached = redis_client.get(cache_key)
    if cached:
        print("캐시 히트!")
        recipes = [RecipeItem(**r) for r in json.loads(cached)]
        return RecipeResponse(recipes=recipes)

    # 1. 공공 API 이름 기반 검색
    recipes_data = await fetch_recipes_by_name(request.query)
    api_recipes = parse_api_recipes(recipes_data, [], [])
    print(f"API 레시피: {len(api_recipes)}개")

    # 2. LLM 레시피 3개 생성
    chain = SEARCH_TEMPLATE_DIRECT | llm | StrOutputParser()
    llm_result = await chain.ainvoke({"query": request.query})
    llm_recipes = parse_llm_recipes(llm_result, [], [])
    print(f"LLM 레시피: {len(llm_recipes)}개")

    # 3. API 먼저 + LLM 뒤에
    all_recipes = api_recipes + llm_recipes

    redis_client.setex(
        cache_key, 3600, json.dumps([r.model_dump() for r in all_recipes])
    )
    return RecipeResponse(recipes=all_recipes)
