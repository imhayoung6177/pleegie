package market_it.pleegie.domain.recipe.dto;

import lombok.Data;

@Data
public class RecipeItemRequest {
    private String name;
    private String category;
    private Long itemMasterId;
}
