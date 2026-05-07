import chromadb
from sentence_transformers import SentenceTransformer
from chromadb.config import Settings

# 한국어 지원 임베딩 모델
model = SentenceTransformer("jhgan/ko-sroberta-multitask")

# Chroma 로컬 DB 설정 (python_ai 폴더 안에 저장)
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# 식재료 컬렉션
collection = chroma_client.get_or_create_collection(
    name="ingredients", metadata={"hnsw:space": "cosine"}
)


def build_vector_store(ingredients: list[dict]):
    """
    식재료 데이터를 임베딩 후 Chroma에 저장
    ingredients: [{"id": 1, "name": "계란", "unit": "개", "category": "단백질"}, ...]
    """
    if not ingredients:
        print("저장할 데이터가 없습니다.")
        return

    names = [ing["name"] for ing in ingredients]
    embeddings = model.encode(names).tolist()

    collection.upsert(
        ids=[str(ing["id"]) for ing in ingredients],
        embeddings=embeddings,
        documents=names,
        metadatas=[
            {
                "name": ing["name"],
                "unit": ing.get("unit", "개"),
                "category": ing.get("category", "기타"),
            }
            for ing in ingredients
        ],
    )
    print(f" {len(ingredients)}개 식재료 임베딩 완료")


def search_similar_ingredients(query: str, top_k: int = 5) -> list[dict]:
    """
    사용자 입력과 유사한 식재료 검색
    """
    if collection.count() == 0:
        print(" 벡터 DB가 비어있습니다.")
        return []

    query_embedding = model.encode([query]).tolist()

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=min(top_k, collection.count()),
        include=["metadatas", "distances", "documents"],
    )

    similar = []
    for i, metadata in enumerate(results["metadatas"][0]):
        distance = results["distances"][0][i]
        similarity = 1 - distance  # cosine distance → similarity

        # 유사도 0.3 이상만 반환
        if similarity >= 0.3:
            similar.append(
                {
                    "id": results["ids"][0][i],
                    "name": metadata["name"],
                    "unit": metadata["unit"],
                    "category": metadata["category"],
                    "similarity": round(similarity, 3),
                }
            )

    return similar


def add_ingredient(ingredient: dict):
    """
    새 식재료 단건을 chroma에 추가
    ingredient: {"id": 1, "name": "계란", "unit": "개", "category": "단백질"}
    """
    collection.upsert(
        ids=[str(ingredient["id"])],
        embeddings=model.encode([ingredient["name"]]).tolist(),
        documents=[ingredient["name"]],
        metadatas=[
            {
                "name": ingredient["name"],
                "unit": ingredient.get("unit", "개"),
                "category": ingredient.get("category", "기타"),
            }
        ],
    )
    print(f"[chroma] 단건 추가: {ingredient['name']} (id={ingredient['id']})")
