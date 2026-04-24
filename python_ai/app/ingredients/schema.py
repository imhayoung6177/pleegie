from pydantic import BaseModel


class IngredientExtractRequest(BaseModel):
    message: str  # "계란2개랑 두부 반모있어"


class IngredientItem(BaseModel):
    name: str  # 계란
    quantity: float  # 2.0
    unit: str  # 개


class IngredientExtractResponse(BaseModel):
    ingredients: list[IngredientItem]


class IngredientInfoRequest(BaseModel):
    ingredients: list[str]


class IngredientInfo(BaseModel):
    name: str
    category: str
    defaultExp: int  # 기본 유통기한 (일 단위)


class IngredientInfoResponse(BaseModel):
    ingredients: list[IngredientInfo]
