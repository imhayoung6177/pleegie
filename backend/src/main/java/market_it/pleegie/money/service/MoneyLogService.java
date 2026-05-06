package market_it.pleegie.money.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.cart.entity.Cart;
import market_it.pleegie.common.exception.CustomException;
import market_it.pleegie.common.exception.ErrorCode;
import market_it.pleegie.money.dto.MoneyLogCreateRequest;
import market_it.pleegie.money.dto.MoneyLogResponse;
import market_it.pleegie.money.entity.MoneyLog;
import market_it.pleegie.money.repository.MoneyLogRepository;
import market_it.pleegie.user.entity.User;
import market_it.pleegie.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MoneyLogService {

    private final MoneyLogRepository moneyLogRepository;
    private final UserRepository userRepository;

    /**
     * 장바구니 구매 항목을 가계부에 기록합니다.
     */
    @Transactional
    public void createLog(Cart cart, String category, String memo) {
        // 장바구니 영수증 정보를 보고 가계부 한 줄을 적습니다.
        MoneyLog log = MoneyLog.builder()
                .user(cart.getUser())             // 영수증 주인
                .cart(cart)                       // 어떤 장바구니 항목인지 연결
                .title(generateTitle(cart))       // 항목 이름 생성
                .total(calculateTotal(cart))      // (가격 * 수량) 계산
                .category(category)               // 식비, 생활비 등 선택값
                .memo(memo)                       // 추가 메모
                .build();

        moneyLogRepository.save(log);
    }

    // 수기 입력 (시장 외 구매)
    @Transactional
    public void createManualLog(Long userId,
                                MoneyLogCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND));

        MoneyLog log = request.toEntity(user);
        moneyLogRepository.save(log);
    }

    @Transactional
    public void deleteLog(Long userId, Long logId) {
        MoneyLog log = moneyLogRepository.findById(logId)
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));

        if (!log.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        moneyLogRepository.delete(log);
    }

    /**
     * 특정 사용자의 가계부 목록을 전체 조회합니다.
     */
    public List<MoneyLogResponse> getLogs(Long userId) {

        // [Step 2] 엔티티(원재료)를 응답용 DTO(완성된 요리)로 변환합니다.
        return moneyLogRepository
                .findAllByUserIdOrderByPurchaseDateDesc(userId)
                .stream()
                .map(MoneyLogResponse::from)
                .collect(Collectors.toList());
    }

    // 제목 생성 로직: 시장 상품이면 [시장명] 상품명, 직접 입력이면 입력명 사용
    private String generateTitle(Cart cart) {
        if (cart.getMarketItem() != null) {
            return "[" + cart.getMarketItem().getMarket().getName() + "] " + cart.getMarketItem().getName();
        }
        return cart.getCustomItemName();
    }

    // 총액 계산 로직: 가격 * 수량
    private Integer calculateTotal(Cart cart) {
        if (cart.getPrice() == null || cart.getQuantity() == null) {
            return 0;
        }

        return Math.round(cart.getPrice() * cart.getQuantity());
    }

}
