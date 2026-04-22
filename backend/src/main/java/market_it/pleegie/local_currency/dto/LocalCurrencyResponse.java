package market_it.pleegie.local_currency.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.local_currency.entity.LocalCurrencyLog;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class LocalCurrencyResponse {

    private Long id;
    private Long userId;
    private String userName;
    private Long marketId;
    private String marketName;
    private Long userCouponId;
    private Integer amount;
    private String status;          // REQUESTED / ISSUED / REJECTED / USED
    private LocalDateTime requestedAt;
    private LocalDateTime issuedAt;
    private LocalDateTime usedAt;
    private String issuedByName;    // 승인한 관리자 이름 (처리 전은 null)

    public static LocalCurrencyResponse from(LocalCurrencyLog log) {
        LocalCurrencyResponse res = new LocalCurrencyResponse();
        res.id = log.getId();
        res.userId = log.getUser().getId();
        res.userName = log.getUser().getName();
        res.marketId = log.getMarket().getId();
        res.marketName = log.getMarket().getName();
        res.userCouponId = log.getUserCoupon().getId();
        res.amount = log.getAmount();
        res.status = log.getStatus();
        res.requestedAt = log.getRequestedAt();
        res.issuedAt = log.getIssuedAt();
        res.usedAt = log.getUsedAt();

        // 승인/반려한 관리자가 있을 때만 이름 표시
        res.issuedByName = log.getIssuedBy() != null
                ? log.getIssuedBy().getName()
                : null;

        return res;
    }
}