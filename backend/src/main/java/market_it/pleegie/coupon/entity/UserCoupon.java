package market_it.pleegie.coupon.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.common.BaseEntity;
import market_it.pleegie.user.entity.User;

@Entity
@Table(name = "user_coupon")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserCoupon extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @Builder.Default
    private Integer stampCount = 0;     // 현재 찍힌 스탬프 수

    @Builder.Default
    private Boolean isCompleted = false; // 스탬프 다 모았는지 여부

    // ── 비즈니스 메서드 ──────────────────────

    // 스탬프 1개 추가 → 목표 달성 시 자동으로 완료 처리
    public void addStamp() {
        this.stampCount++;
        if (this.stampCount >= this.coupon.getRequiredStampCount()) {
            this.isCompleted = true;
        }
    }

    // 지역화폐 발급 후 쿠폰 초기화
    public void reset() {
        this.stampCount = 0;
        this.isCompleted = false;
    }
}