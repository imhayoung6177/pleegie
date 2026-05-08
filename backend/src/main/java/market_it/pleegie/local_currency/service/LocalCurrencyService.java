package market_it.pleegie.local_currency.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.exception.CustomException;
import market_it.pleegie.common.exception.ErrorCode;
import market_it.pleegie.local_currency.dto.LocalCurrencyResponse;
import market_it.pleegie.local_currency.entity.LocalCurrencyLog;
import market_it.pleegie.local_currency.repository.LocalCurrencyLogRepository;
import market_it.pleegie.coupon.entity.UserCoupon;
import market_it.pleegie.coupon.repository.UserCouponRepository;
import market_it.pleegie.local_currency.dto.LocalCurrencyApplyRequest;
import market_it.pleegie.market.entity.Market;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * [비유] 식당의 '포스기(POS)' 뒷단 로직을 담당하는 팀장님입니다.
 * 장부를 정리하고, 실제 결제가 일어났을 때 기록을 업데이트합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본적으로 읽기 전용으로 안전하게 설정
public class LocalCurrencyService {

    private final LocalCurrencyLogRepository logRepository;
    private final UserCouponRepository userCouponRepository;

    // isCompleted=true이고 아직 신청 안 한 UserCoupon 개수
    public Integer getAvailableCount(Long userId) {
        List<UserCoupon> completedCoupons = userCouponRepository
                .findAllByUserIdAndIsCompleted(userId, true);

        return (int) completedCoupons.stream()
                .filter(uc -> !logRepository
                        .existsByUserCouponIdAndStatusIn(
                                uc.getId(),
                                List.of("REQUESTED", "ISSUED")))
                .count();
    }

    // 지역화폐 신청
    @Transactional
    public void apply(Long userId, LocalCurrencyApplyRequest request) {
        UserCoupon userCoupon = userCouponRepository
                .findById(request.getUserCouponId())
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));

        // 본인 쿠폰인지 확인
        if (!userCoupon.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        // 완료된 쿠폰인지 확인
        if (!userCoupon.getIsCompleted()) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        // 이미 신청했는지 확인
        if (logRepository.existsByUserCouponIdAndStatusIn(
                userCoupon.getId(), List.of("REQUESTED", "ISSUED"))) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        // 시장 정보 가져오기
        Market market = userCoupon.getCoupon().getMarket();

        LocalCurrencyLog log = LocalCurrencyLog.builder()
                .user(userCoupon.getUser())
                .market(market)
                .userCoupon(userCoupon)
                .amount(5000)  // 고정 금액
                .build();

        logRepository.save(log);
    }

    /**
     * 특정 사용자의 지역화폐 사용 내역(로그) 조회
     * (비유: 손님이 자기 결제 내역을 영수증 리스트로 확인하는 과정)
     */
    public List<LocalCurrencyResponse> getMyCurrencyLogs(Long userId) {
        // 1. 창고(Repository)에서 유저 ID로 모든 로그를 가져옵니다.
        // 2. 가져온 원재료(Entity)를 손님용 접시(DTO)에 담아 반환합니다.
        return logRepository.findAllByUserIdOrderByRequestedAtDesc(userId)
                .stream()
                .map(LocalCurrencyResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 지역화폐 실제 사용(결제) 처리
     * (비유: 손님이 가게에서 상품권을 내고 결제 버튼을 누르는 순간)
     */
    @Transactional // 데이터가 변하므로 쓰기 권한 부여
    public void useCurrency(Long userId, Long logId) {
        // 1. 해당 결제 내역이 존재하는지 확인
        LocalCurrencyLog log = logRepository.findById(logId)
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));

        // 본인 지역화폐인지 확인
        if (!log.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        // ISSUED 상태인지 확인
        if (!log.getStatus().equals("ISSUED")) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        // 2. 엔티티에 정의된 use() 메서드를 실행하여 상태를 'USED'로 변경
        log.use();
    }
}
