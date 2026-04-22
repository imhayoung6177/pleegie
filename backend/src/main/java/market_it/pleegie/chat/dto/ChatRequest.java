package market_it.pleegie.chat.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

// 챗봇 입력값을 FastAPI로 전달하는 DTO
@Getter
@NoArgsConstructor
public class ChatRequest {
    private String message;
}
