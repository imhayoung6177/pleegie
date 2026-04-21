package market_it.pleegie.cart.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class CartPurchaseRequest {

    // 한 번에 여러 항목 구매 가능
    private List<Long> cartIds;
    private String category;    // 가계부 카테고리 (식비 / 생활비 등)
    private String memo;        // 가계부 메모 (선택)
}