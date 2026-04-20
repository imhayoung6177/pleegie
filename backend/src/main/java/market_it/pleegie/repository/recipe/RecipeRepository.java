package market_it.pleegie.repository.recipe;

import market_it.pleegie.domain.recipe.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    // 작성자 ID로 레시피 목록 조회 (최신순)
    List<Recipe> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 제목에 특정 키워드가 포함된 레시피 검색
    List<Recipe> findByTitleContaining(String keyword);
}
