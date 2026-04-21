package market_it.pleegie.cart.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.cart.entity.Cart;

@Getter
@NoArgsConstructor
public class CartResponse {

    private Long id;
    private Long userId;

    // 시장 품목 정보 (직접 입력이면 null)
    private Long marketItemId;
    private String marketName;

    // 품목명
    // 시장 품목이면 marketItem.name, 직접 입력이면 customItemName
    private String itemName;

    private Integer price;
    private Float quantity;
    private String unit;
    private String status;          // PENDING / PURCHASED

    public static CartResponse from(Cart cart) {
        CartResponse res = new CartResponse();
        res.id = cart.getId();
        res.userId = cart.getUser().getId();
        res.price = cart.getPrice();
        res.quantity = cart.getQuantity();
        res.unit = cart.getUnit();
        res.status = cart.getStatus();

        // 시장 품목인지 직접 입력인지에 따라 분기
        if (cart.getMarketItem() != null) {
            res.marketItemId = cart.getMarketItem().getId();
            res.marketName = cart.getMarketItem().getMarket().getName();
            res.itemName = cart.getMarketItem().getName();
        } else {
            res.marketItemId = null;
            res.marketName = null;
            res.itemName = cart.getCustomItemName();
        }

        return res;
    }
}