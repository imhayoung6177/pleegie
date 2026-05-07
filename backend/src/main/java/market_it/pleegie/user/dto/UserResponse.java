package market_it.pleegie.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.user.entity.User;

@Getter
@NoArgsConstructor
public class UserResponse {

    private Long id;
    private String loginId;
    private String name;
    private String phone;
    private String email;
    private Double latitude;
    private Double longitude;
    private String role;            // USER / MARKET
    private String oauthProvider;   // LOCAL / GOOGLE / KAKAO / NAVER
    private String status;          // ACTIVE / SUSPENDED / DELETED

    public static UserResponse from(User user) {
        UserResponse res = new UserResponse();
        res.id = user.getId();
        res.loginId = user.getLoginId();
        res.name = user.getName();
        res.phone = user.getPhone();
        res.email = user.getEmail();
        res.latitude = user.getLatitude();
        res.longitude = user.getLongitude();
        res.role = user.getRole();
        res.oauthProvider = user.getOauthProvider();
        res.status = user.getStatus();
        return res;
    }

    // ── [준호 추가] ──
    public UserResponse withStatus(String newStatus) {
        this.status = newStatus;
        return this;
    }

    // ── [준호 추가] ──
    public UserResponse withId(Long id) {
        this.id = id;
        return this;
    }
}