package market_it.pleegie.coupon.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.coupon.dto.UserCouponResponse;
import market_it.pleegie.coupon.repository.CouponRepository;
import market_it.pleegie.coupon.repository.UserCouponRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CouponService {

    private final CouponRepository couponRepository; // 쿠폰 종류 창고지기
    private final UserCouponRepository userCouponRepository; // 사용자 지갑 창고지기

    /**
     * 특정 사용자가 보유한 모든 쿠폰 목록을 조회합니다.
     * (WBS의 UserCouponService 역할을 여기서 수행합니다.)
     */
    public List<UserCouponResponse> getMyCoupons(Long userId) {
        return userCouponRepository.findAllByUserId(userId)
                .stream()
                .map(UserCouponResponse::from) // 엔티티를 응답용 DTO로 변환
                .collect(Collectors.toList());
    }

    // 그 외 쿠폰 관련 기능들을 이 아래에 추가해나가면 됩니다!
}