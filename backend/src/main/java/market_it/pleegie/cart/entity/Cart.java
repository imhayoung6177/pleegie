package market_it.pleegie.cart.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.common.BaseEntity;
import market_it.pleegie.market.entity.MarketItem;
import market_it.pleegie.user.entity.User;

@Entity
@Table(name = "cart")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Cart extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 시장 품목 (직접 입력 시 null)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_item_id")
    private MarketItem marketItem;

    private String customItemName;      // 직접 입력 품목명
    private Integer price;              // 구매 시점 가격 직접 저장
    private Float quantity;
    private String unit;

    @Builder.Default
    private String status = "PENDING";  // PENDING / PURCHASED

    // ── 비즈니스 메서드 ──────────────────────

    public void purchase() {
        this.status = "PURCHASED";
    }
}