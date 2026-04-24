package market_it.pleegie.recipe.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class RecipeRecommendResponse {
    private List<RecipeItemResult> recipes;
}
