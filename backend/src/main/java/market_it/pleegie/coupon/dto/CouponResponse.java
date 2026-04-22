package market_it.pleegie.coupon.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.coupon.entity.Coupon;

@Getter
@NoArgsConstructor
public class CouponResponse {

    private Long id;
    private Long marketId;
    private String marketName;
    private String name;
    private Integer requiredStampCount; // 필요한 스탬프 수

    public static CouponResponse from(Coupon coupon) {
        CouponResponse res = new CouponResponse();
        res.id = coupon.getId();
        res.marketId = coupon.getMarket().getId();
        res.marketName = coupon.getMarket().getName();
        res.name = coupon.getName();
        res.requiredStampCount = coupon.getRequiredStampCount();
        return res;
    }
}