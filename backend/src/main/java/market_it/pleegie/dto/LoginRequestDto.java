package market_it.pleegie.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LoginRequestDto {
    private String userId;   // 사용자가 입력한 아이디
    private String password; // 사용자가 입력한 비밀번호
}