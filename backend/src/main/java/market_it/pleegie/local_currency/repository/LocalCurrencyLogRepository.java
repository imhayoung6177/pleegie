package market_it.pleegie.local_currency.repository;

import market_it.pleegie.local_currency.entity.LocalCurrencyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LocalCurrencyLogRepository
        extends JpaRepository<LocalCurrencyLog, Long> {

    // 유저 ID로 전체 지역화폐 이력 조회
    List<LocalCurrencyLog> findAllByUserId(Long userId);

    // 유저 ID + 상태로 조회
    List<LocalCurrencyLog> findAllByUserIdAndStatus(
            Long userId, String status);

    // 시장 ID로 전체 지역화폐 이력 조회 (사업자)
    List<LocalCurrencyLog> findAllByMarketId(Long marketId);

    // 상태별 전체 조회 (관리자 - 승인 대기 목록)
    // 요청 시각 오래된 순으로 정렬
    List<LocalCurrencyLog> findAllByStatusOrderByRequestedAtAsc(
            String status);

    // 관리자 - 상태별 + 시장별 조회
    List<LocalCurrencyLog> findAllByStatusAndMarketId(
            String status, Long marketId);

    // userCoupon ID로 조회
    // (같은 쿠폰으로 중복 신청 방지)
    Optional<LocalCurrencyLog> findByUserCouponId(Long userCouponId);

    // userCoupon ID + 상태로 조회
    // (신청 중인 쿠폰인지 확인)
    boolean existsByUserCouponIdAndStatusIn(
            Long userCouponId, List<String> statuses);

    // 관리자 - 전체 지역화폐 이력 최신순 조회
    List<LocalCurrencyLog> findAllByOrderByRequestedAtDesc();

    // 관리자 - 기간별 지역화폐 발급 통계
    @Query("""
            SELECT lcl.market.id,
                   lcl.market.name,
                   COUNT(lcl) AS issuedCount,
                   SUM(lcl.amount) AS totalAmount
            FROM LocalCurrencyLog lcl
            WHERE lcl.status = 'ISSUED'
            GROUP BY lcl.market.id, lcl.market.name
            ORDER BY totalAmount DESC
            """)
    List<Object[]> findIssuedStatsByMarket();

    // 유저별 지역화폐 총 수령액
    @Query("""
            SELECT SUM(lcl.amount)
            FROM LocalCurrencyLog lcl
            WHERE lcl.user.id = :userId
            AND lcl.status IN ('ISSUED', 'USED')
            """)
    Integer sumAmountByUserId(@Param("userId") Long userId);
}