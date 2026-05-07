from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.recipe.router import router as recipe_router
from app.chatbot.router import router as chatbot_router
from app.ai.router import router as ai_router
from app.ingredients.router import router as ingredients_router

import pymysql
from app.ingredients.vector_store import build_vector_store
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작 시 실행
    print("[startup] DB와 chroma 동기화 시작...")
    try:
        conn = pymysql.connect(
            host=settings.db_host,
            port=settings.db_port,
            user=settings.db_user,
            password=settings.db_password,
            database=settings.db_name,
            charset="utf8mb4",
        )
        try:
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute("SELECT id, name, unit, category FROM item_master")
                all_items = cursor.fetchall()
        finally:
            conn.close()

        build_vector_store(all_items)
        print(f"[startup] {len(all_items)}개 동기화 완료")

    except Exception as e:
        print(f"[startup] 동기화 실패: {e}")

    yield  # 여기서 서버가 실행됨

    # 서버 종료 시 실행 (필요시)
    print("[shutdown] 서버 종료")


app = FastAPI(title="Pleegie AI Server", lifespan=lifespan)

app.include_router(recipe_router, prefix="/recipe", tags=["Recipe"])
app.include_router(chatbot_router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI Router"])
app.include_router(ingredients_router, prefix="/api/ingredients", tags=["Ingredients"])


@app.get("/")
def read_root():
    return {"message": "Welcome to Pleegie AI Server"}
