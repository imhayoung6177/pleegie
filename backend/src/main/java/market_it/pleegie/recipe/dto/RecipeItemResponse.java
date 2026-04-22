package market_it.pleegie.recipe.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.recipe.entity.RecipeItem;

@Getter
@NoArgsConstructor
public class RecipeItemResponse {

    private Long id;
    private Long itemMasterId;
    private String name;        // 재료 이름
    private String category;
    private Float quantity;     // 필요 수량
    private String unit;        // 단위

    public static RecipeItemResponse from(RecipeItem recipeItem) {
        RecipeItemResponse res = new RecipeItemResponse();
        res.id = recipeItem.getId();
        res.itemMasterId = recipeItem.getItemMaster().getId();
        res.name = recipeItem.getName() != null
                ? recipeItem.getName()
                : recipeItem.getItemMaster().getName(); // 별칭 없으면 마스터 이름 사용
        res.category = recipeItem.getCategory();
        res.quantity = recipeItem.getQuantity();
        res.unit = recipeItem.getUnit();
        return res;
    }
}