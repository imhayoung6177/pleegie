from fastapi import APIRouter
from app.ingredients.schema import (
    IngredientExtractRequest,
    IngredientExtractResponse,
    IngredientInfoRequest,
    IngredientInfoResponse,
)
from app.ingredients.service import extract_ingredients, get_ingredient_info

router = APIRouter()


@router.post("/extract", response_model=IngredientExtractResponse)
async def extract(request: IngredientExtractRequest):
    return await extract_ingredients(request)


@router.post("/info", response_model=IngredientInfoResponse)
async def info(request: IngredientInfoRequest):
    return await get_ingredient_info(request)
