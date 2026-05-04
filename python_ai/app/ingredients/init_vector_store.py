"""
공공데이터 API에서 식품 원재료 데이터를 가져와서
1. MySQL item_master 테이블에 INSERT
2. Chroma 벡터 DB에 임베딩 저장
"""

import httpx
import pymysql
from app.ingredients.vector_store import build_vector_store
from app.core.config import settings


async def fetch_food_ingredients() -> list[dict]:
    """공공데이터 API에서 식품 원재료 목록 조회"""
    all_items = []
    page = 1
    num_of_rows = 100

    # 카테고리 매핑 (MLSFC_NM → 우리 카테고리)
    category_map = {
        "식물": "채소",
        "동물": "육류",
        "수산물": "해산물",
        "버섯": "채소",
        "조류": "육류",
        "해조류": "해산물",
        "유지": "양념",
        "당류": "양념",
    }

    print(" 공공데이터 API에서 식재료 데이터 수집 중...")

    async with httpx.AsyncClient(timeout=30) as client:
        while True:
            url = (
                f"http://apis.data.go.kr/1471000/FoodRwmatrInfoService01"
                f"/getFoodRwmatrList01"
                f"?serviceKey={settings.food_api_key}"
                f"&numOfRows={num_of_rows}"
                f"&pageNo={page}"
                f"&type=json"
            )

            try:
                response = await client.get(url)
                data = response.json()

                body = data.get("body", {})
                items = body.get("items", [])

                if not items:
                    break

                total = int(body.get("totalCount", 0))

                for item in items:
                    name = item.get("RPRSNT_RAWMTRL_NM", "").strip()
                    mlsfc = item.get("MLSFC_NM", "").strip()

                    if not name:
                        continue

                    # 한국어 이름만 필터링 (영문자 포함된 것 제외)
                    if any(c.isascii() and c.isalpha() for c in name):
                        continue

                    category = category_map.get(mlsfc, "기타")

                    all_items.append(
                        {
                            "name": name,
                            "category": category,
                            "unit": "개",  # 기본값
                        }
                    )

                print(f" {page}페이지 수집: {len(all_items)}개")

                total = data.get("body", {}).get("totalCount", 0)
                if page * num_of_rows >= total or page >= 10:  # 최대 1000개
                    break

                page += 1

            except Exception as e:
                print(f" API 오류 ({page}페이지): {e}")
                import traceback

                traceback.print_exc()  # 상세 오류 출력
                break

    print(f" 총 {len(all_items)}개 식재료 수집 완료")
    return all_items


def save_to_db(ingredients: list[dict]) -> list[dict]:
    """item_master DB에 저장 후 id 포함한 목록 반환"""
    conn = pymysql.connect(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        database=settings.db_name,
        charset="utf8mb4",
    )

    result = []
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            for ing in ingredients:
                # 중복 체크 후 INSERT
                cursor.execute(
                    "SELECT id FROM item_master WHERE name = %s", (ing["name"],)
                )
                existing = cursor.fetchone()

                if existing:
                    result.append(
                        {
                            "id": existing["id"],
                            "name": ing["name"],
                            "unit": ing["unit"],
                            "category": ing["category"],
                        }
                    )
                else:
                    cursor.execute(
                        "INSERT INTO item_master (name, unit, category) VALUES (%s, %s, %s)",
                        (ing["name"], ing["unit"], ing["category"]),
                    )
                    result.append(
                        {
                            "id": cursor.lastrowid,
                            "name": ing["name"],
                            "unit": ing["unit"],
                            "category": ing["category"],
                        }
                    )

        conn.commit()
        print(f" DB에 {len(result)}개 저장 완료")
    finally:
        conn.close()

    return result


async def init():
    import asyncio

    print(" 공공데이터 API 기반 벡터 DB 초기화 시작...")

    # 1. 공공데이터 API에서 식재료 수집
    ingredients = await fetch_food_ingredients()

    if not ingredients:
        print(" 수집된 데이터가 없습니다.")
        return

    # 2. DB에 저장
    saved = save_to_db(ingredients)

    # 3. Chroma 벡터 DB에 임베딩 저장
    build_vector_store(saved)

    print(" 전체 초기화 완료!")


if __name__ == "__main__":
    import asyncio

    asyncio.run(init())
