package market_it.pleegie.market.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class MarketItemSaleRequest {

    private Integer discountPrice;  // 할인 가격
    private Integer discountRate;   // 할인율(%)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;

    // 둘 중 하나는 반드시 입력했는지 검증
    public boolean isValid() {
        return discountPrice != null
                || discountRate != null;
    }
}