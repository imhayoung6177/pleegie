package market_it.pleegie.fridge.repository;

import market_it.pleegie.fridge.entity.FridgeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface FridgeItemRepository extends JpaRepository<FridgeItem, Long> {

    // 냉장고 ID로 전체 재료 조회
    List<FridgeItem> findAllByFridgeId(Long fridgeId);

    // 유통기한 임박 순으로 정렬 (기획 #22)
    // 유통기한이 null인 재료는 맨 뒤로
    @Query("""
            SELECT fi FROM FridgeItem fi
            WHERE fi.fridge.id = :fridgeId
            ORDER BY
                CASE WHEN fi.exp IS NULL THEN 1 ELSE 0 END,
                fi.exp ASC
            """)
    List<FridgeItem> findAllByFridgeIdOrderByExpAsc(
            @Param("fridgeId") Long fridgeId);

    // 유통기한 임박 재료 조회 (오늘 기준 3일 이내)
    @Query("""
            SELECT fi FROM FridgeItem fi
            WHERE fi.fridge.id = :fridgeId
            AND fi.exp IS NOT NULL
            AND fi.exp <= :targetDate
            AND fi.status != 'EXPIRED'
            """)
    List<FridgeItem> findNearExpiryItems(
            @Param("fridgeId") Long fridgeId,
            @Param("targetDate") LocalDate targetDate);

    // 유통기한 만료 재료 조회 (스케줄러용 - 오늘 기준 만료된 재료)
    @Query("""
            SELECT fi FROM FridgeItem fi
            WHERE fi.exp IS NOT NULL
            AND fi.exp < :today
            AND fi.status != 'EXPIRED'
            """)
    List<FridgeItem> findExpiredItems(
            @Param("today") LocalDate today);

    // 알림 미발송 임박 재료 조회 (스케줄러용)
    @Query("""
            SELECT fi FROM FridgeItem fi
            WHERE fi.exp IS NOT NULL
            AND fi.exp <= :targetDate
            AND fi.notified = false
            """)
    List<FridgeItem> findNotNotifiedNearExpiryItems(
            @Param("targetDate") LocalDate targetDate);

    // item_master_id로 냉장고 재료 조회
    // (레시피 추천 시 냉장고에 있는 재료인지 확인)
    @Query("""
            SELECT fi FROM FridgeItem fi
            WHERE fi.fridge.id = :fridgeId
            AND fi.itemMaster.id IN :itemMasterIds
            """)
    List<FridgeItem> findByFridgeIdAndItemMasterIdIn(
            @Param("fridgeId") Long fridgeId,
            @Param("itemMasterIds") List<Long> itemMasterIds);

    // 카테고리로 재료 조회
    List<FridgeItem> findAllByFridgeIdAndCategory(
            Long fridgeId, String category);

    // status로 재료 조회 (FRESH / NEAR_EXPIRY / EXPIRED)
    List<FridgeItem> findAllByFridgeIdAndStatus(
            Long fridgeId, String status);
}