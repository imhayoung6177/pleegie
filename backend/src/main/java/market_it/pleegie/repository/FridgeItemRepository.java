package market_it.pleegie.repository;


import market_it.pleegie.domain.FridgeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * FridgeItemRepository — 냉장고 재료 DB 접근 인터페이스
 * SQL 스키마의 fridge_id, item_master_id 구조를 반영하여 수정되었습니다.
 */
public interface FridgeItemRepository extends JpaRepository<FridgeItem, Long> {

    /**
     * 특정 냉장고(fridge_id)에 들어있는 모든 재료 조회
     * SQL: SELECT * FROM fridge_item WHERE fridge_id = ?
     */
    List<FridgeItem> findByFridgeId(Long fridgeId);

    /**
     * 특정 냉장고 내에서 특정 카테고리의 재료들만 조회
     * SQL: SELECT * FROM fridge_item WHERE fridge_id = ? AND category = ?
     */
    List<FridgeItem> findByFridgeIdAndCategory(Long fridgeId, String category);

    /**
     * 유통기한(exp)이 지난 재료들만 조회 (폐기 관리용)
     * SQL: SELECT * FROM fridge_item WHERE exp < CURRENT_DATE
     */
    @Query("SELECT f FROM FridgeItem f WHERE f.fridgeId = :fridgeId AND f.exp < CURRENT_DATE")
    List<FridgeItem> findExpiredItems(@Param("fridgeId") Long fridgeId);

    /**
     * 특정 냉장고에 특정 표준 재료(itemMasterId)가 이미 있는지 확인
     * 중복 등록 방지나 수량 합산 로직에 사용됩니다.
     */
    Optional<FridgeItem> findByFridgeIdAndItemMasterId(Long fridgeId, Long itemMasterId);

    /**
     * 특정 냉장고에 담긴 총 재료 개수 조회
     */
    long countByFridgeId(Long fridgeId);

    /* 주의: SQL 스키마의 fridge_item 테이블에 'name' 컬럼이 없고
       대신 'item_master_id'만 있습니다.
       만약 이름으로 검색하고 싶다면 ItemMaster와 JOIN 하거나,
       엔티티에 name 필드를 추가하고 DB 테이블에도 name 컬럼을 추가해야 합니다.
    */
}
