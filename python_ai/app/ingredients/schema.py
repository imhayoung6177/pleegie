from pydantic import BaseModel


class IngredientExtractRequest(BaseModel):
    message: str  # "계란2개랑 두부 반모있어"


class IngredientItem(BaseModel):
    name: str  # 계란
    quantity: float  # 2.0
    unit: str  # 개


class IngredientExtractResponse(BaseModel):
    ingredients: list[IngredientItem]
