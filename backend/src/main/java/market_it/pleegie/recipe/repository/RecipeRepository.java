package market_it.pleegie.recipe.repository;

import market_it.pleegie.recipe.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    // 제목으로 레시피 검색
    List<Recipe> findAllByTitleContaining(String title);

    // 유저가 직접 작성한 레시피 조회
    List<Recipe> findAllByUserId(Long userId);

    // 외부 API 레시피 조회 (user_id = null)
    List<Recipe> findAllByUserIsNull();

    // 외부 API 레시피 중복 체크 (external_id로)
    boolean existsByExternalId(String externalId);

    // 냉장고 재료 기반 레시피 추천 (기획 #8)
    // 냉장고에 있는 재료가 많이 포함된 레시피 순으로 정렬
    @Query("""
            SELECT r FROM Recipe r
            JOIN r.recipeItems ri
            WHERE ri.itemMaster.id IN :itemMasterIds
            GROUP BY r
            ORDER BY COUNT(ri) DESC
            """)
    List<Recipe> findRecipesByItemMasterIds(
            @Param("itemMasterIds") List<Long> itemMasterIds);

    // 유통기한 임박 재료를 먼저 쓰는 레시피 우선 정렬 (기획 #22)
    // 임박 재료 id 리스트를 받아서 해당 재료가 포함된 레시피를 상단으로
    @Query("""
            SELECT r,
                SUM(CASE WHEN ri.itemMaster.id
                    IN :nearExpiryIds THEN 1 ELSE 0 END) AS nearExpiryCount,
                COUNT(ri) AS matchCount
            FROM Recipe r
            JOIN r.recipeItems ri
            WHERE ri.itemMaster.id IN :allItemMasterIds
            GROUP BY r
            ORDER BY nearExpiryCount DESC, matchCount DESC
            """)
    List<Object[]> findRecipesPrioritizingNearExpiry(
            @Param("nearExpiryIds") List<Long> nearExpiryIds,
            @Param("allItemMasterIds") List<Long> allItemMasterIds);

    // 먹고싶은 메뉴 입력 시 레시피 검색 (기획 #10)
    // 제목 또는 재료명으로 검색
    @Query("""
            SELECT DISTINCT r FROM Recipe r
            LEFT JOIN r.recipeItems ri
            WHERE r.title LIKE %:keyword%
            OR ri.name LIKE %:keyword%
            """)
    List<Recipe> findByKeyword(@Param("keyword") String keyword);
}