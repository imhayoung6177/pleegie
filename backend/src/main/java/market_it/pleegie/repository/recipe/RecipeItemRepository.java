package market_it.pleegie.repository.recipe;

import market_it.pleegie.domain.recipe.entity.RecipeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeItemRepository extends JpaRepository<RecipeItem, Long> {

    // 특정 레시피에 들어가는 모든 재료 조회
    List<RecipeItem> findByRecipeId(Long recipeId);
}
