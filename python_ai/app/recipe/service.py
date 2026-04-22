from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings
from app.recipe.schema import (
    RecipeRecommendRequest,
    RecipeSearchRequest,
    RecipeResponse,
    RecipeItem,
)
from app.recipe.rag.retriever import search_recipes

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", google_api_key=settings.gemini_api_key
)

RECOMMEND_TEMPLATE = PromptTemplate(
    input_variables=["ingredients", "recipes"],
    template="""
너는 요리 전문가야. 사용자의 냉장고 재료를 기반으로 만들 수 있는 레시피를 추천해줘.

냉장고 재료: {ingredients}

아래 레시피 목록 중 냉장고 재료로 만들 수 있는 레시피를 추천해줘.
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


def parse_recipes(text: str) -> list[RecipeItem]:
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

        results.append(
            RecipeItem(
                title=lines.get("제목", ""),
                description=lines.get("설명", ""),
                ingredients=[i.strip() for i in lines.get("재료", "").split(",")],
                missing_ingredients=[
                    i.strip() for i in lines.get("부족한재료", "").split(",")
                ],
            )
        )

    return results


async def recommend_by_fridge(request: RecipeRecommendRequest) -> RecipeResponse:
    query = " ".join(request.ingredients)
    recipes = search_recipes(query)

    recipe_text = "\n".join([f"- {r['title']}: {r['ingredients']}" for r in recipes])

    chain = RECOMMEND_TEMPLATE | llm | StrOutputParser()
    result = await chain.ainvoke(
        {"ingredients": ", ".join(request.ingredients), "recipes": recipe_text}
    )

    return RecipeResponse(recipes=parse_recipes(result))


async def search_recipe(request: RecipeSearchRequest) -> RecipeResponse:
    recipes = search_recipes(request.query)

    recipe_text = "\n".join([f"- {r['title']}: {r['ingredients']}" for r in recipes])

    chain = SEARCH_TEMPLATE | llm | StrOutputParser()
    result = await chain.ainvoke(
        {"query": request.query, "ingredients": "없음", "recipes": recipe_text}
    )

    return RecipeResponse(recipes=parse_recipes(result))
