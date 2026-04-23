package market_it.pleegie.chat.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AiRouterResponse {
    private String intent; // 예: "RECIPE_RECOMMEND", "CHATBOT", "RECIPE_SEARCH"
    private String message; // AI 응답 메시지
    private Object data; // 추가 데이터 (레시피 리스트 등 유연하게 처리)
}
