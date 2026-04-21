package market_it.pleegie.coupon.repository;

import market_it.pleegie.coupon.entity.UserCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {

    // 유저 ID로 보유 쿠폰 전체 조회
    List<UserCoupon> findAllByUserId(Long userId);

    // 유저 ID + 쿠폰 ID로 조회 (중복 발급 방지)
    Optional<UserCoupon> findByUserIdAndCouponId(
            Long userId, Long couponId);

    // 유저 ID + 쿠폰 ID 존재 여부 확인
    boolean existsByUserIdAndCouponId(Long userId, Long couponId);

    // 유저 ID + 완료 여부로 조회
    // (지역화폐 신청 가능한 쿠폰 조회)
    List<UserCoupon> findAllByUserIdAndIsCompleted(
            Long userId, Boolean isCompleted);

    // 시장 ID로 해당 시장 쿠폰을 보유한 유저쿠폰 조회
    @Query("""
            SELECT uc FROM UserCoupon uc
            WHERE uc.coupon.market.id = :marketId
            """)
    List<UserCoupon> findAllByMarketId(
            @Param("marketId") Long marketId);

    // 시장 ID + 유저 ID로 조회
    // (QR 스캔 시 해당 시장 쿠폰 찾기)
    @Query("""
            SELECT uc FROM UserCoupon uc
            WHERE uc.user.id = :userId
            AND uc.coupon.market.id = :marketId
            """)
    Optional<UserCoupon> findByUserIdAndMarketId(
            @Param("userId") Long userId,
            @Param("marketId") Long marketId);
}