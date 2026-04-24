package market_it.pleegie.recipe.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.recipe.entity.RecipeBook;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Getter
@NoArgsConstructor
public class RecipeBookSaveResponse {

    private Long id;
    private String title;
    private String description;
    private List<String> ingredients;
    private LocalDateTime savedAt;

    public static RecipeBookSaveResponse from(RecipeBook recipeBook) {
        RecipeBookSaveResponse res = new RecipeBookSaveResponse();
        res.id = recipeBook.getId();
        res.title = recipeBook.getTitle();
        res.description = recipeBook.getDescription();
        res.ingredients = Arrays.asList(recipeBook.getIngredients().split(",")); // → ["당근", "대파", "계란"]
        res.savedAt = recipeBook.getCreatedAt();
        return res;
    }
}
