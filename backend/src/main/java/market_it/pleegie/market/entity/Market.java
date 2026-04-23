package market_it.pleegie.market.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.common.BaseEntity;
import market_it.pleegie.user.entity.User;

@Entity
@Table(name = "market")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Market extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String name;

    private String ceoName;

    @Column(unique = true)
    private String businessNumber;      // 사업자등록번호

    private String phone;
    private Double latitude;
    private Double longitude;

    @Column(unique = true)
    private String qrToken;             // QR 고유 토큰

    private String qrCodeUrl;

    @Builder.Default
    private String status = "PENDING";  // PENDING / APPROVED / SUSPENDED

    // ── 비즈니스 메서드 ──────────────────────

    public void approve() {
        this.status = "APPROVED";
    }

    public void suspend() {
        this.status = "SUSPENDED";
    }

    public void updateQr(String qrToken, String qrCodeUrl) {
        this.qrToken = qrToken;
        this.qrCodeUrl = qrCodeUrl;
    }

    public void updateInfo(String name, String ceoName,
                           String phone, Double latitude,
                           Double longitude) {
        if (name != null) this.name = name;
        if (ceoName != null) this.ceoName = ceoName;
        if (phone != null) this.phone = phone;
        if (latitude != null) this.latitude = latitude;
        if (longitude != null) this.longitude = longitude;
    }
}