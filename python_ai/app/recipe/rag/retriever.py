from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from app.core.config import settings

VECTOR_STORE_PATH = "./vector_store"

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001", google_api_key=settings.gemini_api_key
)


def get_retriever(top_k: int = 15):
    vectorstore = FAISS.load_local(
        VECTOR_STORE_PATH, embeddings, allow_dangerous_deserialization=True
    )
    return vectorstore.as_retriever(search_kwargs={"k": top_k})


def search_recipes(query: str, top_k: int = 15) -> list[dict]:
    retriever = get_retriever(top_k)
    docs = retriever.invoke(query)
    return [doc.metadata for doc in docs]
