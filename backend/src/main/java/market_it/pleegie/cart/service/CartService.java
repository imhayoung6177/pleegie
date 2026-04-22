package market_it.pleegie.cart.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.cart.dto.CartCreateRequest;
import market_it.pleegie.cart.dto.CartPurchaseRequest;
import market_it.pleegie.cart.dto.CartResponse;
import market_it.pleegie.cart.entity.Cart;
import market_it.pleegie.cart.repository.CartRepository;
import market_it.pleegie.fridge.entity.FridgeItem;
import market_it.pleegie.fridge.repository.FridgeItemRepository;
import market_it.pleegie.fridge.repository.FridgeRepository;
import market_it.pleegie.market.entity.MarketItem;
import market_it.pleegie.market.repository.MarketItemRepository;
import market_it.pleegie.money.service.MoneyLogService;
import market_it.pleegie.user.entity.User;
import market_it.pleegie.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본적으로 읽기 전용으로 설정하여 성능을 최적화합니다.
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final MarketItemRepository marketItemRepository;
    private final FridgeItemRepository fridgeItemRepository;
    private final FridgeRepository fridgeRepository;
    private final MoneyLogService moneyLogService;


    /**
     * 1. 장바구니 담기 (Add to Cart)
     * @param userId 사용자 ID
     * @param request 장바구니 생성 요청 DTO
     */
    @Transactional // DB에 데이터를 써야 하므로 쓰기 권한을 부여합니다.
    public void addCart(Long userId, CartCreateRequest request) {
        // [Step 1] 누가 담는지 유저 정보를 찾습니다.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // [Step 2] 시장 물건을 담는 경우, 해당 상품이 있는지 확인합니다. (없으면 null)
        MarketItem marketItem = null;
        if (request.getMarketItemId() != null) {
            marketItem = marketItemRepository.findById(request.getMarketItemId())
                    .orElse(null);
        }

        // [Step 3] DTO에 만든 toEntity()를 사용하여 장부(Entity) 객체로 변환합니다.
        Cart cart = request.toEntity(user, marketItem);

        // [Step 4] 창고지기(Repository)를 통해 DB 창고에 저장합니다.
        cartRepository.save(cart);
    }

    /**
     * 2. 내 장바구니 목록 조회 (Get My Cart)
     * @param userId 사용자 ID
     * @return 장바구니 응답 DTO 리스트
     */
    public List<CartResponse> getMyCart(Long userId) {
        // [Step 1] 특정 사용자의 '구매 대기(PENDING)' 상태인 물건들만 가져옵니다.
        List<Cart> cartEntities = cartRepository.findAllByUserIdAndStatus(userId, "PENDING");

        // [Step 2] 엔티티(원재료)를 화면용 DTO(완성된 요리)로 변환하여 리스트로 반환합니다.
        return cartEntities.stream()
                .map(CartResponse::from) // 아라님이 만든 from() 메서드 사용
                .collect(Collectors.toList());
    }

    /**
     * 3. 장바구니 물건 구매 처리 (Purchase Cart Items)
     * @param userId 사용자 ID
     * @param request 구매 요청 DTO (여러 ID 포함)
     */
    @Transactional
    public void purchaseCarts(Long userId, CartPurchaseRequest request) {
        // [Step 1] 구매하기로 선택한 물건들만 창고에서 꺼내옵니다.
        List<Cart> selectedCarts = cartRepository.findPendingCartsByIds(userId, request.getCartIds());

        // [Step 2] 각 항목을 '구매 완료(PURCHASED)' 상태로 변경합니다.
        for (Cart cart : selectedCarts) {
            cart.purchase(); // 엔티티 내부 로직 실행

            // request에서 전달받은 카테고리(식비 등)와 메모를 함께 넘겨줍니다.
            moneyLogService.createLog(cart, request.getCategory(), request.getMemo());
        }
    }

    /**
     * 4. 장바구니 총액 조회 (Get Total Price)
     * @param userId 사용자 ID
     * @return 미구매 장바구니 총액
     */
    public Integer getTotalPrice(Long userId) {
        // 아라님이 Repository에 만든 커스텀 쿼리를 사용하여 합계를 계산합니다.
        Integer total = cartRepository.sumPendingCartTotal(userId);
        return (total != null) ? total : 0; // 담긴 게 없으면 0원 반환
    }

    /**
     * 부족한 재료 자동 장바구니 담기
     * @param userId 사용자 ID
     * @param recipeItemIds 레시피에 필요한 재료 ID 리스트
     * @param marketId 현재 사용자가 보고 있는 시장 ID
     */
    @Transactional
    public void addMissingIngredients(Long userId, List<Long> recipeItemIds, Long marketId) {
        // [1] 유저의 냉장고 ID 찾기
        Long fridgeId = fridgeRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자의 냉장고를 찾을 수 없습니다."))
                .getId();

        // [2] 냉장고에 이미 있는 재료들 조회
        List<FridgeItem> existingItems = fridgeItemRepository.findByFridgeIdAndItemMasterIdIn(fridgeId, recipeItemIds);
        List<Long> existingItemMasterIds = existingItems.stream()
                .map(fi -> fi.getItemMaster().getId())
                .collect(Collectors.toList());

        // [3] 부족한 재료 ID만 추출 (레시피 재료 - 냉장고 재료)
        List<Long> missingItemIds = recipeItemIds.stream()
                .filter(id -> !existingItemMasterIds.contains(id))
                .collect(Collectors.toList());

        // [4] 부족한 재료를 해당 시장에서 판매 중인지 확인
        List<MarketItem> availableMarketItems = marketItemRepository.findByMarketIdAndItemMasterIdIn(marketId, missingItemIds);

        // [5] 찾은 시장 상품들을 장바구니에 쏙!
        for (MarketItem mi : availableMarketItems) {
            Cart cart = Cart.builder()
                    .user(userRepository.findById(userId).get())
                    .marketItem(mi)
                    .price(mi.getOnSale() ? mi.getDiscountPrice() : mi.getOriginalPrice())
                    .quantity(1.0f) // 기본 1개 설정
                    .unit(mi.getItemMaster().getUnit())
                    .status("PENDING")
                    .build();
            cartRepository.save(cart);
        }
    }
}