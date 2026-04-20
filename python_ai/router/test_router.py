# python_ai/test_router.py
import os
from dotenv import load_dotenv
from intent_classifier import IntentClassifier

# 1. 환경 변수 로드 (API 키 읽기)
load_dotenv()

# 2. 분류기 객체 생성
classifier = IntentClassifier()

# 3. 테스트 질문 리스트
test_questions = [
    "오늘 삼겹살 세일하는 곳 알려줘",  # 황준호 (MARKET) 예상
    "냉장고에 있는 무로 무슨 요리 할 수 있어?",  # 김아라 (RECIPE) 예상
    "어제 산 우유 유통기한 등록해줘",  # 이종빈 (REFRIGERATOR) 예상
    "안녕? 너는 누구니?",  # 하영 (GUIDE) 예상
]

print("--- Pleegie Router LLM 테스트 시작 ---")

for q in test_questions:
    print(f"\n질문: {q}")
    try:
        result = classifier.classify(q)
        # result는 RouterResponse 객체이므로 아래와 같이 접근합니다.
        print(f"결과: 담당자 -> {result.target}")
        print(f"이유: {result.reason}")
    except Exception as e:
        print(f"에러 발생: {e}")
