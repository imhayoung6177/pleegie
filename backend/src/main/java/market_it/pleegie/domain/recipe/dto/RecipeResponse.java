package market_it.pleegie.domain.recipe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class RecipeResponse {
    private Long id;
    private String title;
    private String content;
    private String writerName; // User 엔티티에서 name만 추출
    private LocalDateTime createdAt;
    private List<String> itemNames; // recipeItem들에서 이름만 추출
}
