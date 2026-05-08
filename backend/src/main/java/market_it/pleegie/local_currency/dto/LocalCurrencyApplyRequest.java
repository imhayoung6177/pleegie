package market_it.pleegie.local_currency.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LocalCurrencyApplyRequest {
    private Long userCouponId;  // 어떤 완료된 쿠폰으로 신청하는지
}