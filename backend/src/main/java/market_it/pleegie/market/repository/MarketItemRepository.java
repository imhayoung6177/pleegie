package market_it.pleegie.market.repository;

import market_it.pleegie.market.entity.MarketItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MarketItemRepository extends JpaRepository<MarketItem, Long> {

    // 시장 ID로 전체 품목 조회
    List<MarketItem> findAllByMarketId(Long marketId);

    // 시장 ID + 카테고리로 품목 조회
    List<MarketItem> findAllByMarketIdAndCategory(
            Long marketId, String category);

    // 할인 중인 품목 조회
    List<MarketItem> findAllByMarketIdAndOnSaleTrue(Long marketId);

    // 인기 품목 1위 찾기용 [준호 추가]
    Optional<MarketItem> findFirstByOrderByViewCountDesc();

    // 냉장고에 없는 재료와 매칭되는 품목 조회 (기획 #8)
    // item_master_id가 일치하는 시장 품목 찾기
    @Query("""
            SELECT mi FROM MarketItem mi
            WHERE mi.market.id = :marketId
            AND mi.itemMaster.id IN :itemMasterIds
            AND mi.stock > 0
            """)
    List<MarketItem> findByMarketIdAndItemMasterIdIn(
            @Param("marketId") Long marketId,
            @Param("itemMasterIds") List<Long> itemMasterIds);

    // 할인 시작 1시간 전 품목 조회 (기획 #15 - 주황색 버튼)
    @Query("""
            SELECT mi FROM MarketItem mi
            WHERE mi.onSale = false
            AND mi.startTime IS NOT NULL
            AND mi.startTime BETWEEN :now AND :oneHourLater
            """)
    List<MarketItem> findUpcomingSaleItems(
            @Param("now") LocalDateTime now,
            @Param("oneHourLater") LocalDateTime oneHourLater);

    // 할인 시작 시각 도달한 품목 조회 (기획 #15 - 스케줄러용)
    @Query("""
            SELECT mi FROM MarketItem mi
            WHERE mi.onSale = false
            AND mi.startTime IS NOT NULL
            AND mi.startTime <= :now
            AND mi.endTime > :now
            """)
    List<MarketItem> findItemsToStartSale(
            @Param("now") LocalDateTime now);

    // 할인 종료 시각 도달한 품목 조회 (스케줄러용)
    @Query("""
            SELECT mi FROM MarketItem mi
            WHERE mi.onSale = true
            AND mi.endTime IS NOT NULL
            AND mi.endTime <= :now
            """)
    List<MarketItem> findItemsToEndSale(
            @Param("now") LocalDateTime now);

    // 가까운 시장들의 특정 재료 품목 조회
    // (냉장고에 없는 재료 버튼 클릭 시)
    @Query("""
            SELECT mi FROM MarketItem mi
            WHERE mi.market.id IN :marketIds
            AND mi.itemMaster.id = :itemMasterId
            AND mi.stock > 0
            ORDER BY mi.onSale DESC
            """)
    List<MarketItem> findByMarketIdsAndItemMasterId(
            @Param("marketIds") List<Long> marketIds,
            @Param("itemMasterId") Long itemMasterId);
}