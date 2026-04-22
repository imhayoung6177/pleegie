package market_it.pleegie.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserPasswordUpdateRequest {

    private String currentPassword; // 현재 비밀번호 (본인 확인용)
    private String newPassword;     // 새 비밀번호
}