package market_it.pleegie.cart.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.cart.dto.CartCreateRequest;
import market_it.pleegie.cart.dto.CartPurchaseRequest;
import market_it.pleegie.cart.dto.CartResponse;
import market_it.pleegie.cart.service.CartService;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.common.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/user/cart") // 팀 약속: 리소스는 복수형 사용
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * 1. 장바구니 담기
     * POST http://localhost:8080/user/carts?userId=1
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CartCreateRequest request) {

        cartService.addCart(userDetails.getUserId(), request);

        // 성공 시 팀 약속 양식인 ApiResponse에 담아 보냅니다.
        return ResponseEntity.ok(ApiResponse.ok("장바구니 담기 성공", null));
    }

    /**
     * 2. 내 장바구니 목록 조회
     * GET http://localhost:8080/user/carts/1
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CartResponse>>> getMyCart(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.ok(cartService.getMyCart(userDetails.getUserId())));
    }

    // 장바구니 삭제
    @DeleteMapping("/{cartId}")
    public ResponseEntity<ApiResponse<Void>> deleteCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long cartId
    ) {
        cartService.deleteCart(userDetails.getUserId(), cartId);
        return ResponseEntity.ok(ApiResponse.ok("장바구니에서 삭제되었습니다", null));
    }

    /**
     * 3. 장바구니 물건 구매 처리
     * POST http://localhost:8080/user/carts/purchase?userId=1
     */
    @PostMapping("/purchase")
    public ResponseEntity<ApiResponse<Void>> purchaseCarts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CartPurchaseRequest request) {

        cartService.purchaseCarts(userDetails.getUserId(), request);

        return ResponseEntity.ok(ApiResponse.ok("구매 처리가 완료되었습니다.", null));
    }

    /**
     * 4. 장바구니 총액 조회
     * GET http://localhost:8080/user/carts/total/1
     */
    @GetMapping("/total")
    public ResponseEntity<ApiResponse<Integer>> getTotalPrice(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.ok(cartService.getTotalPrice(userDetails.getUserId())));
    }
}