package market_it.pleegie.money.repository;

import market_it.pleegie.money.entity.MoneyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MoneyLogRepository extends JpaRepository<MoneyLog, Long> {

    // 유저 ID로 가계부 전체 조회 (최신순)
    List<MoneyLog> findAllByUserIdOrderByPurchaseDateDesc(Long userId);

    // 유저 ID + 카테고리로 조회
    List<MoneyLog> findAllByUserIdAndCategory(
            Long userId, String category);

    // 유저 ID + 기간으로 조회
    @Query("""
            SELECT ml FROM MoneyLog ml
            WHERE ml.user.id = :userId
            AND ml.purchaseDate BETWEEN :startDate AND :endDate
            ORDER BY ml.purchaseDate DESC
            """)
    List<MoneyLog> findAllByUserIdAndPeriod(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // 유저 ID + 기간 + 카테고리로 조회
    @Query("""
            SELECT ml FROM MoneyLog ml
            WHERE ml.user.id = :userId
            AND ml.category = :category
            AND ml.purchaseDate BETWEEN :startDate AND :endDate
            ORDER BY ml.purchaseDate DESC
            """)
    List<MoneyLog> findAllByUserIdAndCategoryAndPeriod(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // 유저 ID + 기간 총 지출 합계
    @Query("""
            SELECT SUM(ml.total)
            FROM MoneyLog ml
            WHERE ml.user.id = :userId
            AND ml.purchaseDate BETWEEN :startDate AND :endDate
            """)
    Integer sumTotalByUserIdAndPeriod(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // 카테고리별 지출 합계 (가계부 통계)
    @Query("""
            SELECT ml.category, SUM(ml.total)
            FROM MoneyLog ml
            WHERE ml.user.id = :userId
            AND ml.purchaseDate BETWEEN :startDate AND :endDate
            GROUP BY ml.category
            """)
    List<Object[]> sumTotalGroupByCategory(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}