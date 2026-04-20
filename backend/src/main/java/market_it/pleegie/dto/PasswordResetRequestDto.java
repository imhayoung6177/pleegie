package market_it.pleegie.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PasswordResetRequestDto {
    private String userId;      // 본인 확인용 아이디
    private String name;        // 본인 확인용 이름
    private String email;       // 본인 확인용 이메일
    private String businessNumber; // 상인 회원 본인 확인용 사업자 번호
    private String newPassword; // 새로 설정할 비밀번호
}