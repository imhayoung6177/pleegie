package market_it.pleegie.coupon.repository;

import market_it.pleegie.coupon.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    // 시장 ID로 쿠폰 조회 (시장당 쿠폰 1개)
    Optional<Coupon> findByMarketId(Long marketId);

    // 시장 ID로 쿠폰 존재 여부 확인
    // (사업자 가입 시 쿠폰 중복 생성 방지)
    boolean existsByMarketId(Long marketId);

    // 전체 쿠폰 목록 조회 (관리자)
    List<Coupon> findAllByOrderByCreatedAtDesc();
}