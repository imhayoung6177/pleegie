import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from router.intent_classifier import IntentClassifier, RouterResponse

# 1. FastAPI 앱 객체 초기화
app = FastAPI(
    title="Pleegie AI Router API",
    description="사용자의 질문 의도를 분석하여 담당 팀원을 배정하는 AI 서버입니다.",
    version="1.0.0",
)

# 2. AI 분류기 엔진 로드 (서버 시작 시 한 번만 실행)
try:
    classifier = IntentClassifier()
    print("IntentClassifier가 성공적으로 로드되었습니다.")
except Exception as e:
    print(f" 분류기 로드 실패: {e}")


# 3. 데이터 규격 정의 (Pydantic 모델)
class ChatRequest(BaseModel):
    message: str


# --- API 엔드포인트 시작 ---


@app.get("/")
def health_check():
    """서버 상태 확인용 엔드포인트"""
    return {"status": "ok", "message": "Pleegie AI 서버가 가동 중입니다."}


@app.post("/ai/route", response_model=RouterResponse)
def route_intent(request: ChatRequest):
    """
    사용자의 질문을 분석하여 적절한 담당자를 배정합니다.
    - message: 사용자 입력 텍스트
    """
    try:
        # 입력값이 비어있는지 검증
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="질문 내용을 입력해주세요.")

        # IntentClassifier 엔진 호출 (Gemini 3 사용)
        result = classifier.classify(request.message)

        # 분석 결과 반환
        return result

    except Exception as e:
        # 에러 발생 시 500 에러와 함께 원인 반환
        raise HTTPException(status_code=500, detail=str(e))
