package market_it.pleegie.money.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.cart.entity.Cart;
import market_it.pleegie.money.dto.MoneyLogResponse;
import market_it.pleegie.money.entity.MoneyLog;
import market_it.pleegie.money.repository.MoneyLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MoneyLogService {

    private final MoneyLogRepository moneyLogRepository;

    /**
     * 장바구니 구매 항목을 가계부에 기록합니다.
     */
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

    // 제목 생성 로직: 시장 상품이면 [시장명] 상품명, 직접 입력이면 입력명 사용
    private String generateTitle(Cart cart) {
        if (cart.getMarketItem() != null) {
            return "[" + cart.getMarketItem().getMarket().getName() + "] " + cart.getMarketItem().getName();
        }
        return cart.getCustomItemName();
    }

    // 총액 계산 로직: 가격 * 수량
    private Integer calculateTotal(Cart cart) {
        return Math.round(cart.getPrice() * cart.getQuantity());
    }

    /**
     * 특정 사용자의 가계부 목록을 전체 조회합니다.
     */
    public List<MoneyLogResponse> getLogs(Long userId) {
        // [Step 1] 창고(Repository)에서 해당 사용자의 데이터를 최신순으로 가져옵니다.
        List<MoneyLog> logs = moneyLogRepository.findAllByUserIdOrderByPurchaseDateDesc(userId);

        // [Step 2] 엔티티(원재료)를 응답용 DTO(완성된 요리)로 변환합니다.
        return logs.stream()
                .map(MoneyLogResponse::from)
                .collect(Collectors.toList());
    }
}
