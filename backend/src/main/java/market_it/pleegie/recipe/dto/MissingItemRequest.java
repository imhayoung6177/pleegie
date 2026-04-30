package market_it.pleegie.recipe.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class MissingItemRequest {
    private List<String> missingIngredients;
    private Double latitude;
    private Double longitude;
}
