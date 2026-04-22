package market_it.pleegie.money.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.money.entity.MoneyLog;
import market_it.pleegie.user.entity.User;

@Getter
@NoArgsConstructor
public class MoneyLogCreateRequest {

    private Long cartId;        // 장바구니 구매 시 (수기 입력 시 null)
    private String title;       // 수기 입력 시 필수
    private Integer total;
    private String category;    // 식비 / 생활비 등
    private String memo;

    public MoneyLog toEntity(User user) {
        return MoneyLog.builder()
                .user(user)
                .title(this.title)
                .total(this.total)
                .category(this.category)
                .memo(this.memo)
                .build();
    }
}