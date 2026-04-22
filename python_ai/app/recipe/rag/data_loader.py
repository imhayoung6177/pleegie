import httpx
from app.core.config import settings

BASE_URL = "http://openapi.foodsafetykorea.go.kr/api"


async def fetch_recipes(start: int = 1, end: int = 1000) -> list[dict]:
    url = f"{BASE_URL}/{settings.recipe_api_key}/COOKRCP01/json/{start}/{end}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()

    recipes = data.get("COOKRCP01", {}).get("row", [])

    return [
        {
            "id": r.get("RCP_SEQ"),
            "title": r.get("RCP_NM"),  # 레시피명
            "category": r.get("RCP_PAT2"),  # 요리 분류
            "ingredients": r.get("RCP_PARTS_DTLS"),  # 재료 텍스트
            "image_url": r.get("ATT_FILE_NO_MAIN"),  # 대표 이미지
            "manual": [  # 조리 순서
                r.get(f"MANUAL{str(i).zfill(2)}")
                for i in range(1, 21)
                if r.get(f"MANUAL{str(i).zfill(2)}")
            ],
        }
        for r in recipes
    ]
