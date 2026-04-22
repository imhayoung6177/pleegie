package market_it.pleegie.money.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.money.entity.MoneyLog;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class MoneyLogResponse {

    private Long id;
    private Long userId;
    private Long cartId;        // 수기 입력이면 null
    private String title;       // 구매 항목명
    private Integer total;
    private String category;    // 식비 / 생활비 등
    private String memo;
    private LocalDateTime purchaseDate;
    private LocalDateTime createdAt;

    public static MoneyLogResponse from(MoneyLog moneyLog) {
        MoneyLogResponse res = new MoneyLogResponse();
        res.id = moneyLog.getId();
        res.userId = moneyLog.getUser().getId();
        res.cartId = moneyLog.getCart() != null
                ? moneyLog.getCart().getId()
                : null;
        res.title = moneyLog.getTitle();
        res.total = moneyLog.getTotal();
        res.category = moneyLog.getCategory();
        res.memo = moneyLog.getMemo();
        res.purchaseDate = moneyLog.getPurchaseDate();
        res.createdAt = moneyLog.getCreatedAt();
        return res;
    }
}