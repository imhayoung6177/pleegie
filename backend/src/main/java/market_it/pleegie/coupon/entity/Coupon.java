package market_it.pleegie.coupon.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.common.BaseEntity;
import market_it.pleegie.market.entity.Market;

@Entity
@Table(name = "coupon")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Coupon extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;              // 어느 시장의 쿠폰인지

    @Column(nullable = false)
    private String name;                // 예: "○○시장 스탬프 쿠폰"

    @Builder.Default
    private Integer requiredStampCount = 10;  // 지역화폐 신청에 필요한 스탬프 수

    // [준호 추가] 쿠폰 통계를 위한 사용 여부 필드
    @Builder.Default
    private Boolean isUsed = false; // 기본값은 '사용 안 함(false)'

    // ── 비즈니스 메서드 ──────────────────────

    // [준호 추가] 쿠폰을 사용 처리하는 기능
    public void use() {
        this.isUsed = true;
    }
}