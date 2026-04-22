from fastapi import APIRouter
from app.recipe.schema import (
    RecipeRecommendRequest,
    RecipeSearchRequest,
    RecipeResponse,
)
from app.recipe.service import recommend_by_fridge, search_recipe

router = APIRouter()


@router.post("/recommend", response_model=RecipeResponse)
async def recommend(request: RecipeRecommendRequest):
    return await recommend_by_fridge(request)


@router.post("/search", response_model=RecipeResponse)
async def search(request: RecipeSearchRequest):
    return await search_recipe(request)
