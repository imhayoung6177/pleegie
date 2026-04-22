import os
import pickle
import time
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.schema import Document
from app.core.config import settings

VECTOR_STORE_PATH = "./vector_store"
CHECKPOINT_FILE = f"{VECTOR_STORE_PATH}/checkpoint.pkl"

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001", google_api_key=settings.gemini_api_key
)


def build_vector_store(recipes: list[dict]):
    os.makedirs(VECTOR_STORE_PATH, exist_ok=True)

    # 체크포인트에서 이어서 시작
    if os.path.exists(CHECKPOINT_FILE):
        with open(CHECKPOINT_FILE, "rb") as f:
            checkpoint = pickle.load(f)
        documents = checkpoint["documents"]
        start_idx = checkpoint["last_index"] + 1
        print(f"체크포인트 발견 — {start_idx}번째부터 이어서 시작")
    else:
        documents = []
        start_idx = 0

    for i, recipe in enumerate(recipes[start_idx:], start=start_idx):
        text = f"{recipe['title']} {recipe['ingredients']}"
        documents.append(Document(page_content=text, metadata=recipe))
        print(f"{i+1}/{len(recipes)} 문서 준비 완료")

        # 체크포인트 저장 (10개마다)
        if (i + 1) % 10 == 0:
            with open(CHECKPOINT_FILE, "wb") as f:
                pickle.dump({"documents": documents, "last_index": i}, f)

        # 90개마다 70초 대기
        if (i + 1) % 90 == 0:
            print("Rate limit 예방 대기 중... (70초)")
            time.sleep(70)

    print("벡터 DB 구축 중...")
    vectorstore = FAISS.from_documents(documents, embeddings)
    vectorstore.save_local(VECTOR_STORE_PATH)

    # 체크포인트 삭제
    if os.path.exists(CHECKPOINT_FILE):
        os.remove(CHECKPOINT_FILE)

    print(f"벡터 DB 저장 완료 — 총 {len(recipes)}개 레시피")
