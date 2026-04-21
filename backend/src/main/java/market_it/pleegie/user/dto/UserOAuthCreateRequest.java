package market_it.pleegie.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.user.entity.User;

@Getter
@NoArgsConstructor
public class UserOAuthCreateRequest {

    private String name;
    private String email;
    private String phone;
    private Double latitude;
    private Double longitude;
    private String role;            // USER / MARKET
    private String oauthProvider;   // GOOGLE / KAKAO / NAVER
    private String oauthId;         // OAuth 고유 ID

    public User toEntity() {
        return User.builder()
                .name(this.name)
                .email(this.email)
                .phone(this.phone)
                .latitude(this.latitude)
                .longitude(this.longitude)
                .role(this.role)
                .oauthProvider(this.oauthProvider)
                .oauthId(this.oauthId)
                .build();
    }
}