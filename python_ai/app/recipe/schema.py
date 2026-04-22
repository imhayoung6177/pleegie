from pydantic import BaseModel


class RecipeRecommendRequest(BaseModel):
    ingredients: list[str]  # 냉장고 재료 리스트


class RecipeSearchRequest(BaseModel):
    query: str  # 먹고싶은 음식명


class RecipeItem(BaseModel):
    title: str
    description: str
    ingredients: list[str]
    missing_ingredients: list[str]  # 냉장고에 없는 재료


class RecipeResponse(BaseModel):
    recipes: list[RecipeItem]
