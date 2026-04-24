package market_it.pleegie.recipe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class RecipeItemResult {

    private String title;
    private String description;
    private List<String> ingredients;

    @JsonProperty("missing_ingredients")
    private List<String> missingIngredients;

    @JsonProperty("match_score")
    private Float matchScore;

    @JsonProperty("has_expiring")
    private Boolean hasExpiring;
}
