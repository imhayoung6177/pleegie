import asyncio
from app.recipe.rag.data_loader import fetch_recipes
from app.recipe.rag.embedder import build_vector_store


async def main():
    print("레시피 데이터 불러오는 중...")
    recipes = await fetch_recipes(start=1, end=1000)
    print(f"총 {len(recipes)}개 레시피 로드 완료")

    print("벡터 DB 구축 중...")
    build_vector_store(recipes)
    print("완료!")


if __name__ == "__main__":
    asyncio.run(main())
