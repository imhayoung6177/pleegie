from fastapi import APIRouter
from app.ingredients.schema import (
    IngredientExtractRequest,
    IngredientExtractResponse,
    IngredientInfoRequest,
    IngredientInfoResponse,
)
from app.ingredients.service import extract_ingredients, get_ingredient_info
from app.ingredients.vector_store import search_similar_ingredients

router = APIRouter()


@router.post("/extract", response_model=IngredientExtractResponse)
async def extract(request: IngredientExtractRequest):
    return await extract_ingredients(request)


@router.post("/info", response_model=IngredientInfoResponse)
async def info(request: IngredientInfoRequest):
    return await get_ingredient_info(request)


@router.get("/search")
async def search(name: str):
    """
    사용자 입력과 유사한 식재료 검색 (벡터 유사도 검색)
    GET /ingredients/search?name=검색어
    """
    results = search_similar_ingredients(name, top_k=5)
    return {"results": results}
