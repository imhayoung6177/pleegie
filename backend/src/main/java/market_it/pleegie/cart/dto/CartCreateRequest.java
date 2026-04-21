package market_it.pleegie.cart.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.cart.entity.Cart;
import market_it.pleegie.market.entity.MarketItem;
import market_it.pleegie.user.entity.User;

@Getter
@NoArgsConstructor
public class CartCreateRequest {

    private Long marketItemId;      // 시장 품목 (직접 입력 시 null)
    private String customItemName;  // 직접 입력 품목명 (시장 품목 선택 시 null)
    private Integer price;          // 직접 입력 시 가격
    private Float quantity;
    private String unit;

    public Cart toEntity(User user, MarketItem marketItem) {
        return Cart.builder()
                .user(user)
                .marketItem(marketItem)         // 직접 입력 시 null
                .customItemName(this.customItemName)
                .price(marketItem != null
                        ? marketItem.getOriginalPrice() // 시장 품목이면 시장 가격 사용
                        : this.price)                   // 직접 입력이면 입력 가격 사용
                .quantity(this.quantity)
                .unit(this.unit)
                .build();
    }
}