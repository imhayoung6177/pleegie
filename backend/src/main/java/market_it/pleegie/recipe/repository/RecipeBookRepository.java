package market_it.pleegie.recipe.repository;

import market_it.pleegie.recipe.entity.RecipeBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RecipeBookRepository extends JpaRepository<RecipeBook, Long> {

    // 유저 ID로 저장한 레시피 목록 조회
    List<RecipeBook> findAllByUserId(Long userId);

    // 유저 ID + 레시피 ID로 조회 (중복 저장 방지)
    Optional<RecipeBook> findByUserIdAndRecipeId(
            Long userId, Long recipeId);

    // 저장 여부 확인
    boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);

    // 가장 많이 저장된 레시피 순 조회 (통계용)
    @Query("""
            SELECT rb.recipe.id, COUNT(rb) AS saveCount
            FROM RecipeBook rb
            GROUP BY rb.recipe.id
            ORDER BY saveCount DESC
            """)
    List<Object[]> findMostSavedRecipes();

    // 유저 ID + 레시피 제목으로 조회 (중복 저장 방지)
    boolean existsByUserIdAndTitle(Long userId, String title);
}