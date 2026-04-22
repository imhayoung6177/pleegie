package market_it.pleegie.recipe.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.recipe.entity.Recipe;
import market_it.pleegie.user.entity.User;

import java.util.List;

@Getter
@NoArgsConstructor
public class RecipeCreateRequest {

    private String title;
    private String content;
    private String imageUrl;
    private List<RecipeItemRequest> recipeItems;  // 재료 리스트

    public Recipe toEntity(User user) {
        return Recipe.builder()
                .user(user)
                .title(this.title)
                .content(this.content)
                .imageUrl(this.imageUrl)
                .build();
    }
}