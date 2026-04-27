from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str
    recipe_api_key: str
    groq_api_key: str
    vector_db_path: str = "./vector_store"
    redis_host: str = "localhost"
    redis_port: int = 6379

    class Config:
        env_file = ".env"


settings = Settings()
