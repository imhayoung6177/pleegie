package market_it.pleegie.market.repository;

import market_it.pleegie.market.entity.Market;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MarketRepository extends JpaRepository<Market, Long> {

    // 유저 ID로 시장 조회 (사업자 1:1)
    Optional<Market> findByUserId(Long userId);

    // QR 토큰으로 시장 조회 (QR 스캔 시)
    Optional<Market> findByQrToken(String qrToken);

    // 사업자등록번호 중복 체크
    boolean existsByBusinessNumber(String businessNumber);

    // 상태별 시장 조회 (관리자 - PENDING / APPROVED / SUSPENDED)
    List<Market> findAllByStatus(String status);

    // 가장 가까운 시장 조회 (기획 #8 - 위치 기반)
    // Haversine 공식으로 거리 계산
    @Query("""
            SELECT m FROM Market m
            WHERE m.status = 'APPROVED'
            ORDER BY (
                6371 * acos(
                    cos(radians(:latitude)) *
                    cos(radians(m.latitude)) *
                    cos(radians(m.longitude) - radians(:longitude)) +
                    sin(radians(:latitude)) *
                    sin(radians(m.latitude))
                )
            ) ASC
            """)
    List<Market> findNearestMarkets(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude);

    // 시장 이름으로 검색 (관리자)
    List<Market> findAllByNameContaining(String name);
}