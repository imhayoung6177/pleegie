package market_it.pleegie.recipe.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class RecipeBookSaveRequest {
    private String title;
    private String description;
    private List<String> ingredients;
}
