package market_it.pleegie.user.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.common.BaseEntity;

@Entity
@Table(name = "user",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"oauth_provider", "oauth_id"}
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login_id", unique = true)
    private String loginId;             // OAuth 전용 가입은 null

    private String password;            // OAuth 전용 가입은 null

    @Column(nullable = false)
    private String name;

    private String phone;
    private String email;
    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    private String role;                // USER / MARKET

    @Column(name = "oauth_provider")
    private String oauthProvider;       // LOCAL / GOOGLE / KAKAO / NAVER

    @Column(name = "oauth_id")
    private String oauthId;

    @Builder.Default
    private Integer point = 0;

    @Builder.Default
    private String status = "ACTIVE";   // ACTIVE / SUSPENDED / DELETED

    // ── 비즈니스 메서드 ──────────────────────

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void updatePoint(int amount) {
        this.point += amount;
    }

    public void suspend() {
        this.status = "SUSPENDED";
    }

    public void delete() {
        this.status = "DELETED";
    }

    public void updateInfo(String name, String phone,
                           String email, Double latitude,
                           Double longitude) {
        if (name != null) this.name = name;
        if (phone != null) this.phone = phone;
        if (email != null) this.email = email;
        if (latitude != null) this.latitude = latitude;
        if (longitude != null) this.longitude = longitude;
    }
}