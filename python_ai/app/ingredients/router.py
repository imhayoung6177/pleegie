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


# Spring Boot에서 새 ItemMaster 생성 시 호출
@router.post("/add")
async def add(item: dict):
    """
    새 식재료를 chroma에 단건 추가
    Spring Boot ItemMasterController에서 호출
    """
    try:
        add_ingredient(item)
        return {"success": True, "message": f"{item['name']} chroma 추가 완료"}
    except Exception as e:
        return {"success": False, "message": str(e)}
