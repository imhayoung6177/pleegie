package market_it.pleegie.domain;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AiRouterResponse {
    private String target; // 배정된 팀원
    private String reason; // 배정 이유
}
