from pydantic import BaseModel


class RecipeRecommendRequest(BaseModel):
    ingredients: list[str]  # 냉장고 재료 리스트
    expiring_ingredients: list[str]


class RecipeSearchRequest(BaseModel):
    query: str  # 먹고싶은 음식명


class RecipeItem(BaseModel):
    title: str
    description: str
    ingredients: list[str]
    missing_ingredients: list[str]  # 냉장고에 없는 재료
    match_score: float = 0.0  # 매칭 점수
    has_expiring: bool = False  # 유통기한 임박 재료 포함 여부


class RecipeResponse(BaseModel):
    recipes: list[RecipeItem]
