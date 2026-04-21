package market_it.pleegie.fridge.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.fridge.entity.Fridge;
import market_it.pleegie.fridge.entity.FridgeItem;
import market_it.pleegie.item.entity.ItemMaster;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class FridgeItemCreateRequest {

    private Long itemMasterId;  // 어떤 재료인지 (필수)
    private String category;
    private Float quantity;     // 수량
    private String unit;        // 단위 (개, g, ml 등)
    private LocalDate exp;      // 유통기한
    private Integer price;
    private String imageUrl;

    public FridgeItem toEntity(Fridge fridge, ItemMaster itemMaster) {
        return FridgeItem.builder()
                .fridge(fridge)
                .itemMaster(itemMaster)
                .category(this.category)
                .quantity(this.quantity)
                .unit(this.unit)
                .exp(this.exp)
                .price(this.price)
                .imageUrl(this.imageUrl)
                .build();
    }
}