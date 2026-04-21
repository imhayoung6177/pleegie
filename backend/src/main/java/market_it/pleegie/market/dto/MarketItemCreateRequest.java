package market_it.pleegie.market.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.item.entity.ItemMaster;
import market_it.pleegie.market.entity.Market;
import market_it.pleegie.market.entity.MarketItem;

@Getter
@NoArgsConstructor
public class MarketItemCreateRequest {

    private Long itemMasterId;      // 어떤 재료인지 (필수)
    private String name;
    private String category;
    private Integer originalPrice;
    private String imageUrl;
    private Integer stock;

    public MarketItem toEntity(Market market, ItemMaster itemMaster) {
        return MarketItem.builder()
                .market(market)
                .itemMaster(itemMaster)
                .name(this.name)
                .category(this.category)
                .originalPrice(this.originalPrice)
                .imageUrl(this.imageUrl)
                .stock(this.stock)
                .build();
    }
}