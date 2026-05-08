package market_it.pleegie.stamp.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.exception.CustomException;
import market_it.pleegie.common.exception.ErrorCode;
import market_it.pleegie.coupon.entity.Coupon;
import market_it.pleegie.coupon.entity.UserCoupon;
import market_it.pleegie.coupon.repository.CouponRepository;
import market_it.pleegie.coupon.repository.UserCouponRepository;
import market_it.pleegie.market.entity.Market;
import market_it.pleegie.market.repository.MarketRepository;
import market_it.pleegie.stamp.dto.StampResponse;
import market_it.pleegie.stamp.entity.Stamp;
import market_it.pleegie.stamp.repository.StampRepository;
import market_it.pleegie.user.entity.User;
import market_it.pleegie.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional // ✅ 이 어노테이션이 있어야 도장 찍기와 쿠폰 완성이 '한 번에' 안전하게 처리됩니다.
public class StampService {

    private final StampRepository stampRepository;
    private final UserCouponRepository userCouponRepository;
    private final UserRepository userRepository;
    private final MarketRepository marketRepository;
    private final CouponRepository couponRepository;

    /**
     * 방문 스탬프 생성 로직
     */
    public void createStamp(Long userId, String qrToken) {

        Market market = marketRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new CustomException(ErrorCode.MARKET_NOT_FOUND));

        if (!market.getStatus().equals("APPROVED")) {
            throw new CustomException(ErrorCode.MARKET_NOT_APPROVED);
        }

        // [Step 1] 오늘 이미 이 시장에서 도장을 찍었는지 확인합니다. (중복 방지)
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN); // 오늘 00:00:00
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);   // 오늘 23:59:59

        if (stampRepository.existsTodayStamp(userId, market.getId(), startOfDay, endOfDay)) {
            throw new CustomException(ErrorCode.ALREADY_STAMPED); // ✅ 손님에게 정중히 거절!
        }

        // [Step 3] 실제 도장(Stamp) 데이터를 생성하여 저장합니다.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        // MARKET,ADMIN 역할은 스탬프 적립 불가
        if ("MARKET".equals(user.getRole()) || "ADMIN".equals(user.getRole())) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        // [Step 2] 이 유저가 이 시장에서 현재 모으고 있는 도장판(UserCoupon)을 찾습니다.
        // 만약 없다면, 새로운 도장판을 하나 만들어줘야 합니다. (Optional 활용)
        UserCoupon userCoupon = userCouponRepository.findByUserIdAndMarketId(userId, market.getId())
                .orElseGet(() -> {
                    // 해당 시장의 쿠폰 찾기
                    Coupon coupon = couponRepository
                            .findByMarketId(market.getId())
                            .orElseThrow(() -> new CustomException(
                                    ErrorCode.COUPON_NOT_FOUND));

                    // UserCoupon 자동 생성
                    return userCouponRepository.save(
                            UserCoupon.builder()
                                    .user(user)
                                    .coupon(coupon)
                                    .build()
                    );
                });


        Stamp stamp = Stamp.builder()
                .user(user)
                .market(market)
                .userCoupon(userCoupon)
                .build();

        stampRepository.save(stamp);

        // stampCount 증가 + 목표 달성 시 isCompleted = true
        userCoupon.addStamp();
    }

    @Transactional(readOnly = true)
    public List<StampResponse> getStampHistory(Long userId) {
        return stampRepository.findAllByUserId(userId)
                .stream()
                .map(StampResponse::from)
                .collect(Collectors.toList());
    }
}