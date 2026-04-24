package market_it.pleegie.recipe.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RecipeSearchRequest {
    private String query; // 먹고싶은 음식명
}
