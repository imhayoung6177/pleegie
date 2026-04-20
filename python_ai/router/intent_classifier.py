import os
import json
from google import genai  # 최신 라이브러리는 호출 방식이 다릅니다
from dotenv import load_dotenv
from pydantic import BaseModel
from enum import Enum

load_dotenv()


class TargetTeam(str, Enum):
    REFRIGERATOR = "LEE_JONG_BIN"
    RECIPE = "KIM_ARA"
    MARKET = "HWANG_JUN_HO"
    GUIDE = "HEO_HA_YOUNG"


class RouterResponse(BaseModel):
    target: TargetTeam
    reason: str


class IntentClassifier:
    def __init__(self):
        # 최신 버전 클라이언트 생성 방식
        self.client = genai.Client(
            api_key=os.getenv("GOOGLE_API_KEY"), http_options={"api_version": "v1alpha"}
        )
        self.model_name = "models/gemini-3-flash-preview"
        for m in self.client.models.list():
            print(f"사용 가능한 모델: {m.name}")

    def classify(self, user_text):
        prompt = f"""
        너는 Pleegie 서비스의 안내 데스크야. 질문을 분석해서 담당 팀원을 결정해.
        반드시 아래 JSON 형식으로만 대답해. 다른 설명은 하지 마.
        {{ "target": "팀원이름", "reason": "이유" }}

        팀원 리스트:
        - LEE_JONG_BIN: 냉장고, 재료, 수량, 유통기한 관련
        - KIM_ARA: 레시피, 요리 방법, 음식 추천 관련
        - HWANG_JUN_HO: 시장 상점 정보, 할인, 마켓 위치 관련
        - HEO_HA_YOUNG: 인사, 앱 이용 가이드, 일반 대화, 신고 관련

        질문: {user_text}
        """

        # 최신 SDK 호출 문법
        response = self.client.models.generate_content(
            model=self.model_name, contents=prompt
        )

        content = response.text.strip()

        # JSON 추출
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        data = json.loads(content)
        return RouterResponse(target=data["target"], reason=data["reason"])
