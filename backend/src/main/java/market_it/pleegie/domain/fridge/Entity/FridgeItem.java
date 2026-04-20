package market_it.pleegie.domain.fridge.Entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import market_it.pleegie.domain.BaseEntity;
import market_it.pleegie.domain.item.entity.ItemMaster;
import market_it.pleegie.domain.market.entity.Market;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FridgeItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Fridge와의 N:1 관계 (지연 로딩 필수)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fridge_id", nullable = false)
    private Fridge fridge;

    // ItemMaster와의 N:1 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_master_id", nullable = false)
    private ItemMaster itemMaster;

    // Market과의 N:1 관계 (null 허용이므로 optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id")
    private Market market;

    private String category;

    private LocalDate exp; // 유통기한 (Date -> LocalDate)

    private Integer price;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    public static FridgeItem create(Fridge fridge, ItemMaster itemMaster, Market market,
                                    String category, LocalDate exp, Integer price, String imageUrl) {
        FridgeItem fridgeItem = new FridgeItem();
        fridgeItem.setFridge(fridge);
        fridgeItem.setItemMaster(itemMaster);
        fridgeItem.setCategory(category);
        fridgeItem.setExp(exp);
        fridgeItem.setPrice(price);
        fridgeItem.setImageUrl(imageUrl);
        return fridgeItem;
    }
}



