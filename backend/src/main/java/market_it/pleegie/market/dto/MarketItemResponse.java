package market_it.pleegie.market.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.market.entity.MarketItem;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class MarketItemResponse {

    private Long id;
    private Long marketId;
    private String marketName;
    private Long itemMasterId;
    private String name;
    private String category;
    private Integer originalPrice;
    private Integer discountPrice;  // 할인 가격
    private Integer discountRate;   // 할인율(%)
    private String imageUrl;
    private Integer stock;
    private Boolean onSale;         // 할인 중 여부
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String saleStatus;      // 할인 상태 (NONE / UPCOMING / ON_SALE)

    public static MarketItemResponse from(MarketItem item) {
        MarketItemResponse res = new MarketItemResponse();
        res.id = item.getId();
        res.marketId = item.getMarket().getId();
        res.marketName = item.getMarket().getName();
        res.itemMasterId = item.getItemMaster().getId();
        res.name = item.getName();
        res.category = item.getCategory();
        res.originalPrice = item.getOriginalPrice();
        res.discountPrice = item.getDiscountPrice();
        res.discountRate = item.getDiscountRate();
        res.imageUrl = item.getImageUrl();
        res.stock = item.getStock();
        res.onSale = item.getOnSale();
        res.startTime = item.getStartTime();
        res.endTime = item.getEndTime();

        // 할인 상태 계산
        // NONE: 할인 없음
        // UPCOMING: 1시간 이내 할인 시작 (버튼 주황색)
        // ON_SALE: 할인 중 (버튼 빨간색)
        LocalDateTime now = LocalDateTime.now();
        if (item.getOnSale()) {
            res.saleStatus = "ON_SALE";
        } else if (item.getStartTime() != null
                && now.isAfter(item.getStartTime().minusHours(1))
                && now.isBefore(item.getStartTime())) {
            res.saleStatus = "UPCOMING";
        } else {
            res.saleStatus = "NONE";
        }

        return res;
    }
}