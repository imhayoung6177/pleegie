from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str
    recipe_api_key: str
    vector_db_path: str = "./vector_store"
    # spring_internal_secret: str  # Spring -> FastAPI 내부 통신 검증용

    class Config:
        env_file = ".env"


settings = Settings()
