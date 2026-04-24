package market_it.pleegie.stamp.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.exception.CustomException;
import market_it.pleegie.common.exception.ErrorCode;
import market_it.pleegie.coupon.entity.UserCoupon;
import market_it.pleegie.coupon.repository.UserCouponRepository;
import market_it.pleegie.market.entity.Market;
import market_it.pleegie.market.repository.MarketRepository;
import market_it.pleegie.stamp.entity.Stamp;
import market_it.pleegie.stamp.repository.StampRepository;
import market_it.pleegie.user.entity.User;
import market_it.pleegie.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@Transactional // ✅ 이 어노테이션이 있어야 도장 찍기와 쿠폰 완성이 '한 번에' 안전하게 처리됩니다.
public class StampService {

    private final StampRepository stampRepository;
    private final UserCouponRepository userCouponRepository;
    private final UserRepository userRepository;
    private final MarketRepository marketRepository;

    /**
     * 방문 스탬프 생성 로직
     */
    public void createStamp(Long userId, Long marketId) {

        // [Step 1] 오늘 이미 이 시장에서 도장을 찍었는지 확인합니다. (중복 방지)
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN); // 오늘 00:00:00
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);   // 오늘 23:59:59

        if (stampRepository.existsTodayStamp(userId, marketId, startOfDay, endOfDay)) {
            throw new CustomException(ErrorCode.ALREADY_STAMPED); // ✅ 손님에게 정중히 거절!
        }

        // [Step 3] 실제 도장(Stamp) 데이터를 생성하여 저장합니다.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        Market market = marketRepository.findById(marketId)
                .orElseThrow(() -> new CustomException(ErrorCode.MARKET_NOT_FOUND));

        // [Step 2] 이 유저가 이 시장에서 현재 모으고 있는 도장판(UserCoupon)을 찾습니다.
        // 만약 없다면, 새로운 도장판을 하나 만들어줘야 합니다. (Optional 활용)
        UserCoupon userCoupon = userCouponRepository.findByUserIdAndMarketId(userId, marketId)
                .orElseThrow(() -> new CustomException(ErrorCode.COUPON_NOT_FOUND));


        Stamp stamp = Stamp.builder()
                .user(user)
                .market(market)
                .userCoupon(userCoupon)
                .build();

        stampRepository.save(stamp);

        // stampCount 증가 + 목표 달성 시 isCompleted = true
        userCoupon.addStamp();
    }
}