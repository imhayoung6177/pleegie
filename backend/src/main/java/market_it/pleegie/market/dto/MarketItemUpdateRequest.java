package market_it.pleegie.market.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MarketItemUpdateRequest {

    private String name;
    private String category;
    private Integer originalPrice;
    private String imageUrl;
    private Integer stock;
}