package market_it.pleegie.recipe.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.recipe.entity.RecipeBook;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class RecipeBookResponse {

    private Long id;
    private Long recipeId;
    private String recipeTitle;
    private String recipeImageUrl;
    private LocalDateTime savedAt;  // 저장한 시각

    public static RecipeBookResponse from(RecipeBook recipeBook) {
        RecipeBookResponse res = new RecipeBookResponse();
        res.id = recipeBook.getId();
        res.recipeId = recipeBook.getRecipe().getId();
        res.recipeTitle = recipeBook.getRecipe().getTitle();
        res.recipeImageUrl = recipeBook.getRecipe().getImageUrl();
        res.savedAt = recipeBook.getCreatedAt();
        return res;
    }
}