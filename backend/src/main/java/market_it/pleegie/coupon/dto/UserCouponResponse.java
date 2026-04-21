package market_it.pleegie.coupon.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.coupon.entity.UserCoupon;

@Getter
@NoArgsConstructor
public class UserCouponResponse {

    private Long id;
    private Long userId;
    private Long couponId;
    private String couponName;
    private String marketName;
    private Integer stampCount;         // 현재 찍힌 스탬프 수
    private Integer requiredStampCount; // 필요한 스탬프 수
    private Boolean isCompleted;        // 스탬프 다 모았는지 여부

    public static UserCouponResponse from(UserCoupon userCoupon) {
        UserCouponResponse res = new UserCouponResponse();
        res.id = userCoupon.getId();
        res.userId = userCoupon.getUser().getId();
        res.couponId = userCoupon.getCoupon().getId();
        res.couponName = userCoupon.getCoupon().getName();
        res.marketName = userCoupon.getCoupon().getMarket().getName();
        res.stampCount = userCoupon.getStampCount();
        res.requiredStampCount = userCoupon.getCoupon().getRequiredStampCount();
        res.isCompleted = userCoupon.getIsCompleted();
        return res;
    }
}