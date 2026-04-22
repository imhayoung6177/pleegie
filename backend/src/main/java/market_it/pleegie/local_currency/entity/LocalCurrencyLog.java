package market_it.pleegie.local_currency.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.admin.entity.Admin;
import market_it.pleegie.coupon.entity.UserCoupon;
import market_it.pleegie.market.entity.Market;
import market_it.pleegie.user.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "local_currency_log",
        indexes = @Index(name = "idx_currency_pending",
                columnList = "status, requested_at"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class LocalCurrencyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    // 어느 쿠폰이 완성되어 신청했는지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_coupon_id", nullable = false)
    private UserCoupon userCoupon;

    @Column(nullable = false)
    private Integer amount;             // 지역화폐 금액

    @Builder.Default
    private String status = "REQUESTED"; // REQUESTED / ISSUED / REJECTED / USED

    @Builder.Default
    private LocalDateTime requestedAt = LocalDateTime.now();

    // 승인 또는 반려한 관리자 (처리 전은 null)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by")
    private Admin issuedBy;

    private LocalDateTime issuedAt;
    private LocalDateTime usedAt;

    // ── 비즈니스 메서드 ──────────────────────

    public void approve(Admin admin) {
        this.status = "ISSUED";
        this.issuedBy = admin;
        this.issuedAt = LocalDateTime.now();
    }

    public void reject(Admin admin) {
        this.status = "REJECTED";
        this.issuedBy = admin;
        this.issuedAt = LocalDateTime.now();
    }

    public void use() {
        this.status = "USED";
        this.usedAt = LocalDateTime.now();
    }
}