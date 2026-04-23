package market_it.pleegie.market.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.common.BaseEntity;
import market_it.pleegie.item.entity.ItemMaster;

import java.time.LocalDateTime;

@Entity
@Table(name = "market_item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MarketItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_master_id", nullable = false)
    private ItemMaster itemMaster;

    private String name;
    private String category;
    private Integer originalPrice;
    private Integer discountPrice;      // 할인 가격
    private Integer discountRate;       // 할인율(%)
    private String imageUrl;

    @Builder.Default
    private Integer stock = 0;

    @Builder.Default
    private Boolean onSale = false;     // 할인 중 여부

    private LocalDateTime startTime;    // 할인 시작 시각
    private LocalDateTime endTime;      // 할인 종료 시각

    // ── 비즈니스 메서드 ──────────────────────

    public void startSale(Integer discountPrice, Integer discountRate,
                          LocalDateTime startTime, LocalDateTime endTime) {
        this.discountPrice = discountPrice;
        this.discountRate = discountRate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.onSale = true;
    }

    public void endSale() {
        this.onSale = false;
        this.discountPrice = null;
        this.discountRate = null;
    }

    public void updateStock(int stock) {
        this.stock = stock;
    }

    public void updateInfo(String name, String category,
                           Integer originalPrice,
                           String imageUrl, Integer stock) {
        if (name != null) this.name = name;
        if (category != null) this.category = category;
        if (originalPrice != null)
            this.originalPrice = originalPrice;
        if (imageUrl != null) this.imageUrl = imageUrl;
        if (stock != null) this.stock = stock;
    }
}