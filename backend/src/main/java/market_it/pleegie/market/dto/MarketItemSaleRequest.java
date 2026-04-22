package market_it.pleegie.market.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class MarketItemSaleRequest {

    private Integer discountPrice;  // 할인 가격
    private Integer discountRate;   // 할인율(%)
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}