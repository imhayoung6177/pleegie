package market_it.pleegie.recipe.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RecipeItemRequest {

    private Long itemMasterId;  // 어떤 재료인지 (필수)
    private String name;        // 재료 별칭 (선택)
    private String category;
    private Float quantity;     // 필요 수량
    private String unit;        // 단위 (g, ml, 개 등)
}
