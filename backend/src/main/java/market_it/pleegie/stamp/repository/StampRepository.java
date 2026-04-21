package market_it.pleegie.stamp.repository;

import market_it.pleegie.stamp.entity.Stamp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StampRepository extends JpaRepository<Stamp, Long> {

    // 유저 ID로 전체 스탬프 조회
    List<Stamp> findAllByUserId(Long userId);

    // 유저 ID + 시장 ID로 스탬프 조회
    List<Stamp> findAllByUserIdAndMarketId(
            Long userId, Long marketId);

    // 유저쿠폰 ID로 스탬프 조회
    List<Stamp> findAllByUserCouponId(Long userCouponId);

    // 유저쿠폰 ID로 스탬프 개수 조회
    int countByUserCouponId(Long userCouponId);

    // 당일 중복 스탬프 방지
    // (같은 시장에 같은 날 이미 스탬프를 찍었는지 확인)
    @Query("""
            SELECT COUNT(s) > 0 FROM Stamp s
            WHERE s.user.id = :userId
            AND s.market.id = :marketId
            AND s.stampedAt >= :startOfDay
            AND s.stampedAt < :endOfDay
            """)
    boolean existsTodayStamp(
            @Param("userId") Long userId,
            @Param("marketId") Long marketId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    // 시장별 스탬프 총 개수 조회 (사업자 - 방문 현황)
    @Query("""
            SELECT COUNT(s) FROM Stamp s
            WHERE s.market.id = :marketId
            """)
    int countByMarketId(@Param("marketId") Long marketId);

    // 시장별 최근 스탬프 목록 조회 (사업자 - 방문 현황)
    @Query("""
            SELECT s FROM Stamp s
            WHERE s.market.id = :marketId
            ORDER BY s.stampedAt DESC
            """)
    List<Stamp> findRecentStampsByMarketId(
            @Param("marketId") Long marketId);
}