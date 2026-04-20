package market_it.pleegie.repository;

import market_it.pleegie.domain.fridge.Entity.FridgeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * FridgeItemRepository
 *
 * FridgeItem 엔티티 구조:
 *  - fridge    : Fridge 객체 (ManyToOne)
 *  - itemMaster: ItemMaster 객체 (ManyToOne)
 *  - market    : Market 객체 (ManyToOne, nullable)
 *
 * JPA 메서드 이름 규칙:
 *  findByFridge_Id → fridge 필드의 id 기준 조회
 *  existsByFridge_IdAndItemMaster_Id → 중복 체크
 */
public interface FridgeItemRepository extends JpaRepository<FridgeItem, Long> {

    /**
     * 특정 냉장고의 모든 재료 조회
     * SQL: SELECT * FROM fridge_item WHERE fridge_id = ?
     */
    List<FridgeItem> findByFridge_Id(Long fridgeId);

    /**
     * 특정 냉장고 + 카테고리 재료 조회
     */
    List<FridgeItem> findByFridge_IdAndCategory(Long fridgeId, String category);

    /**
     * 유통기한 지난 재료 조회
     * JPQL: 엔티티 필드명 기준
     *   f.fridge.id    → fridge 객체의 id
     *   f.exp          → 유통기한
     *   CURRENT_DATE   → 오늘 날짜
     */
    @Query("SELECT f FROM FridgeItem f WHERE f.fridge.id = :fridgeId AND f.exp < CURRENT_DATE")
    List<FridgeItem> findExpiredItems(@Param("fridgeId") Long fridgeId);

    /**
     * 중복 등록 방지 — 같은 냉장고에 같은 재료가 이미 있는지 확인
     * fridge.id + itemMaster.id 조합으로 체크
     */
    boolean existsByFridge_IdAndItemMaster_Id(Long fridgeId, Long itemMasterId);

    /**
     * 냉장고 재료 개수
     */
    long countByFridge_Id(Long fridgeId);
}