import chromadb
from sentence_transformers import SentenceTransformer

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_collection("ingredients")

print(f"총 저장된 재료 수: {collection.count()}")

# jhgan 모델로 직접 임베딩해서 쿼리
model = SentenceTransformer("jhgan/ko-sroberta-multitask")
query_embedding = model.encode(["달걀"]).tolist()

results = collection.query(query_embeddings=query_embedding, n_results=5)

print("\n[달걀 검색 결과]")
for i, (doc, dist) in enumerate(zip(results["documents"][0], results["distances"][0])):
    print(f"{i+1}. {doc} (거리: {dist:.4f})")
