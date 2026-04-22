package market_it.pleegie.stamp.service;

import lombok.RequiredArgsConstructor;
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
            throw new IllegalStateException("오늘은 이미 이 시장의 스탬프를 받으셨습니다."); // ✅ 손님에게 정중히 거절!
        }

        // [Step 2] 이 유저가 이 시장에서 현재 모으고 있는 도장판(UserCoupon)을 찾습니다.
        // 만약 없다면, 새로운 도장판을 하나 만들어줘야 합니다. (Optional 활용)
        UserCoupon userCoupon = userCouponRepository.findByUserIdAndMarketId(userId, marketId)
                .orElseThrow(() -> new IllegalArgumentException("활성화된 도장판이 없습니다. 먼저 쿠폰을 등록해주세요."));

        // [Step 3] 실제 도장(Stamp) 데이터를 생성하여 저장합니다.
        User user = userRepository.findById(userId).get();
        Market market = marketRepository.findById(marketId).get();

        Stamp stamp = Stamp.builder()
                .user(user)
                .market(market)
                .userCoupon(userCoupon)
                .build();

        stampRepository.save(stamp);

        // [Step 4] 도장을 찍은 후, 이 도장판의 총 개수가 목표치에 도달했는지 확인합니다.
        // (예: 도장 10개가 모였으면 쿠폰 완성!)
        int currentCount = stampRepository.countByUserCouponId(userCoupon.getId());

        // 쿠폰 엔티티에 설정된 목표 개수(requiredStampCount)를 가져와 비교합니다.
        if (currentCount >= userCoupon.getCoupon().getRequiredStampCount()) {
            userCoupon.addStamp(); // ✅ 도장판 완성! 이제 할인 쿠폰으로 사용 가능해집니다.
        }
    }
}