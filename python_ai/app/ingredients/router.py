from fastapi import APIRouter
from app.ingredients.schema import IngredientExtractRequest, IngredientExtractResponse
from app.ingredients.service import extract_ingredients

router = APIRouter()


@router.post("/extract", response_model=IngredientExtractResponse)
async def extract(request: IngredientExtractRequest):
    return await extract_ingredients(request)
