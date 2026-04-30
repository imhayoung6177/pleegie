package market_it.pleegie.recipe.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import market_it.pleegie.market.entity.MarketItem;

import java.util.List;

@Getter
@AllArgsConstructor
public class MissingItemResponse {
    private List<MarketItemInfo> markets;

    @Getter
    @AllArgsConstructor
    public static class MarketItemInfo{
        private Long marketId;
        private String marketName;
        private Double latitude;
        private Double longitude;
        private List<ItemInfo> items;
    }

    @Getter
    @AllArgsConstructor
    public static class ItemInfo{
        private Long itemId;
        private String name;
        private Integer originalPrice;
        private Integer discountPrice;
        private Integer discountRate;
        private Boolean onSale;
    }
}
