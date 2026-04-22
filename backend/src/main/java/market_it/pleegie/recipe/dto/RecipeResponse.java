package market_it.pleegie.recipe.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.recipe.entity.Recipe;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
public class RecipeResponse {

    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private String writerName;      // 직접 작성 레시피만 존재, 외부 API는 null
    private String sourceUrl;       // 외부 API 레시피 출처, 직접 작성은 null
    private LocalDateTime createdAt;
    private List<RecipeItemResponse> recipeItems;  // 재료 리스트

    public static RecipeResponse from(Recipe recipe) {
        RecipeResponse res = new RecipeResponse();
        res.id = recipe.getId();
        res.title = recipe.getTitle();
        res.content = recipe.getContent();
        res.imageUrl = recipe.getImageUrl();
        res.sourceUrl = recipe.getSourceUrl();
        res.createdAt = recipe.getCreatedAt();

        // user가 null이면 외부 API 레시피 → writerName null
        res.writerName = recipe.getUser() != null
                ? recipe.getUser().getName()
                : null;

        // 재료 리스트 변환
        res.recipeItems = recipe.getRecipeItems().stream()
                .map(RecipeItemResponse::from)
                .collect(Collectors.toList());

        return res;
    }
}