package market_it.pleegie.recipe.repository;

import market_it.pleegie.recipe.entity.RecipeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeItemRepository extends JpaRepository<RecipeItem, Long> {

    // 레시피 ID로 재료 목록 조회
    List<RecipeItem> findAllByRecipeId(Long recipeId);

    // 레시피에 포함된 재료 중 냉장고에 없는 재료 조회 (기획 #8)
    // recipeId의 재료 중 fridgeItemMasterIds에 없는 것만 반환
    @Query("""
            SELECT ri FROM RecipeItem ri
            WHERE ri.recipe.id = :recipeId
            AND ri.itemMaster.id NOT IN :fridgeItemMasterIds
            """)
    List<RecipeItem> findMissingItems(
            @Param("recipeId") Long recipeId,
            @Param("fridgeItemMasterIds") List<Long> fridgeItemMasterIds);

    // item_master_id로 조회 (해당 재료가 포함된 레시피 재료 목록)
    List<RecipeItem> findAllByItemMasterId(Long itemMasterId);
}