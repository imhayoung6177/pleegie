package market_it.pleegie.stamp.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.stamp.entity.Stamp;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class StampResponse {

    private Long id;
    private Long userId;
    private Long marketId;
    private String marketName;
    private Long userCouponId;
    private LocalDateTime stampedAt;

    public static StampResponse from(Stamp stamp) {
        StampResponse res = new StampResponse();
        res.id = stamp.getId();
        res.userId = stamp.getUser().getId();
        res.marketId = stamp.getMarket().getId();
        res.marketName = stamp.getMarket().getName();
        res.userCouponId = stamp.getUserCoupon().getId();
        res.stampedAt = stamp.getStampedAt();
        return res;
    }
}