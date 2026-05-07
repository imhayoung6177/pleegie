from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer("jhgan/ko-sroberta-multitask")

embeddings = model.encode(["달걀", "계란", "감자다이스"])

sim = cosine_similarity([embeddings[0]], [embeddings[1], embeddings[2]])
print(f"달걀-계란 유사도: {sim[0][0]:.4f}")
print(f"달걀-감자다이스 유사도: {sim[0][1]:.4f}")
