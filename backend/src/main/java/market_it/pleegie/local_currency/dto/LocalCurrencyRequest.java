package market_it.pleegie.local_currency.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LocalCurrencyRequest {

    private Long userCouponId;  // 완성된 쿠폰 ID
    private Long marketId;      // 어느 시장 지역화폐인지
    private Integer amount;     // 지역화폐 금액
}