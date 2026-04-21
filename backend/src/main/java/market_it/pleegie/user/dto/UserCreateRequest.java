package market_it.pleegie.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.user.entity.User;

@Getter
@NoArgsConstructor
public class UserCreateRequest {

    private String loginId;
    private String password;
    private String name;
    private String phone;
    private String email;
    private Double latitude;
    private Double longitude;
    private String role;        // USER / MARKET

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