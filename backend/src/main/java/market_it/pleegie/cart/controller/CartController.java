package market_it.pleegie.cart.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.cart.dto.CartCreateRequest;
import market_it.pleegie.cart.dto.CartPurchaseRequest;
import market_it.pleegie.cart.dto.CartResponse;
import market_it.pleegie.cart.service.CartService;
import market_it.pleegie.common.ApiResponse; // 팀 공통 응답 양식
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/carts") // 팀 약속: 리소스는 복수형 사용
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * 1. 장바구니 담기
     * POST http://localhost:8080/user/carts?userId=1
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addCart(
            @RequestParam Long userId,
            @RequestBody CartCreateRequest request) {

        cartService.addCart(userId, request);

        // 성공 시 팀 약속 양식인 ApiResponse에 담아 보냅니다.
        return ResponseEntity.ok(ApiResponse.ok("장바구니 담기 성공", null));
    }

    /**
     * 2. 내 장바구니 목록 조회
     * GET http://localhost:8080/user/carts/1
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<CartResponse>>> getMyCart(
            @PathVariable Long userId) {

        List<CartResponse> cartList = cartService.getMyCart(userId);

        return ResponseEntity.ok(ApiResponse.ok("장바구니 목록 조회 성공", cartList));
    }

    /**
     * 3. 장바구니 물건 구매 처리
     * POST http://localhost:8080/user/carts/purchase?userId=1
     */
    @PostMapping("/purchase")
    public ResponseEntity<ApiResponse<Void>> purchaseCarts(
            @RequestParam Long userId,
            @RequestBody CartPurchaseRequest request) {

        cartService.purchaseCarts(userId, request);

        return ResponseEntity.ok(ApiResponse.ok("구매 처리가 완료되었습니다.", null));
    }

    /**
     * 4. 장바구니 총액 조회
     * GET http://localhost:8080/user/carts/total/1
     */
    @GetMapping("/total/{userId}")
    public ResponseEntity<ApiResponse<Integer>> getTotalPrice(
            @PathVariable Long userId) {

        Integer totalPrice = cartService.getTotalPrice(userId);

        return ResponseEntity.ok(ApiResponse.ok("장바구니 총액 조회 성공", totalPrice));
    }
}