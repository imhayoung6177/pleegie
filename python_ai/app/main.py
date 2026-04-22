from fastapi import FastAPI
from app.recipe.router import router as recipe_router
from app.chatbot.router import router as chatbot_router
from app.ai.router import router as ai_router
from app.ingredients.router import router as ingredients_router

app = FastAPI(title="Pleegie AI Server")

app.include_router(recipe_router, prefix="/recipe", tags=["Recipe"])
app.include_router(chatbot_router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI Router"])
app.include_router(ingredients_router, prefix="/api/ingredients", tags=["Ingredients"])


@app.get("/")
def read_root():
    return {"message": "Welcome to Pleegie AI Server"}
