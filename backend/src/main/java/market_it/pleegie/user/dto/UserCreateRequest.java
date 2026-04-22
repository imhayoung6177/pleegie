package market_it.pleegie.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.user.entity.User;

@Getter
@NoArgsConstructor
public class UserCreateRequest {

    @NotBlank(message = "아이디를 입력해주세요")
    @Size(min = 4, max = 20,
            message = "아이디는 4~20자 사이여야 합니다")
    private String loginId;

    @NotBlank(message = "비밀번호를 입력해주세요")
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다")
    private String password;

    @NotBlank(message = "이름을 입력해주세요")
    private String name;

    private String phone;
    private String email;
    private Double latitude;
    private Double longitude;

    @NotBlank(message = "역할을 선택해주세요")
    private String role;

    public User toEntity(String encodedPassword) {
        return User.builder()
                .loginId(this.loginId)
                .password(encodedPassword)
                .name(this.name)
                .phone(this.phone)
                .email(this.email)
                .latitude(this.latitude)
                .longitude(this.longitude)
                .role(this.role)
                .oauthProvider("LOCAL")
                .build();
    }
}