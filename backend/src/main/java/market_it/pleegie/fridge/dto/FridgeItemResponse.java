package market_it.pleegie.fridge.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.fridge.entity.FridgeItem;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class FridgeItemResponse {

    private Long id;
    private Long fridgeId;
    private Long itemMasterId;
    private String name;        // ItemMaster에서 가져온 재료 이름
    private String category;
    private Float quantity;     // 수량
    private String unit;        // 단위
    private LocalDate exp;      // 유통기한
    private Integer price;
    private String imageUrl;
    private Boolean notified;   // 유통기한 임박 알림 발송 여부
    private String status;      // FRESH / NEAR_EXPIRY / EXPIRED

    public static FridgeItemResponse from(FridgeItem item) {
        FridgeItemResponse res = new FridgeItemResponse();
        res.id = item.getId();
        res.fridgeId = item.getFridge().getId();
        res.itemMasterId = item.getItemMaster().getId();
        res.name = item.getItemMaster().getName();
        res.category = item.getCategory();
        res.quantity = item.getQuantity();
        res.unit = item.getUnit();
        res.exp = item.getExp();
        res.price = item.getPrice();
        res.imageUrl = item.getImageUrl();
        res.notified = item.getNotified();
        res.status = item.getStatus();
        return res;
    }
}