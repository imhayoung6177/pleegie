package market_it.pleegie.fridge.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.common.BaseEntity;
import market_it.pleegie.item.entity.ItemMaster;

import java.time.LocalDate;

@Entity
@Table(name = "fridge_item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class FridgeItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fridge_id", nullable = false)
    private Fridge fridge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_master_id", nullable = false)
    private ItemMaster itemMaster;

    private String category;
    private Float quantity;         // 수량
    private String unit;
    private LocalDate exp;          // 유통기한
    private Integer price;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Builder.Default
    private Boolean notified = false;   // 유통기한 임박 알림 발송 여부

    @Builder.Default
    private String status = "FRESH";    // FRESH / NEAR_EXPIRY / EXPIRED

    // ── 비즈니스 메서드 ──────────────────────

    public void updateInfo(Float quantity, String unit,
                           LocalDate exp, Integer price, String category) {
        this.quantity = quantity;
        this.unit = unit;
        this.exp = exp;
        this.price = price;
        this.category = category;
    }

    public void markNotified() {
        this.notified = true;
    }

    public void updateStatus(String status) {
        this.status = status;
    }
}