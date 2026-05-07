from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    groq_api_key: str
    recipe_api_key: str
    food_api_key: str
    vector_db_path: str = "./vector_store"
    redis_host: str = "localhost"
    redis_port: int = 6379

    db_host: str = "localhost"
    db_port: int = Field(3306, env="DB_PORT")
    db_user: str = Field("root", env="DB_USER")
    db_password: str = Field(..., env="DB_PASSWORD")
    db_name: str = Field("pleegie", env="DB_NAME")

    class Config:
        env_file = ".env"


settings = Settings()
