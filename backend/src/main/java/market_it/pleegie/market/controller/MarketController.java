package market_it.pleegie.market.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.common.security.CustomUserDetails;
import market_it.pleegie.market.dto.*;
import market_it.pleegie.market.service.MarketService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    // ── 시장 등록 ─────────────────────────────

    @PostMapping("/market/signup")
    public ResponseEntity<ApiResponse<MarketResponse>>
    createMarket(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @Valid @RequestBody MarketCreateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(marketService.createMarket(
                        userDetails.getUserId(), request)));
    }

    // ── 내 시장 조회 ──────────────────────────

    @GetMapping("/market/mypage")
    public ResponseEntity<ApiResponse<MarketResponse>>
    getMyMarket(
            @AuthenticationPrincipal
            CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                ApiResponse.ok(marketService.getMyMarket(
                        userDetails.getUserId())));
    }

    // ── 시장 정보 수정 ────────────────────────

    @PutMapping("/market/mypage")
    public ResponseEntity<ApiResponse<MarketResponse>>
    updateMarket(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @RequestBody MarketCreateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(marketService.updateMarket(
                        userDetails.getUserId(), request)));
    }

    // ── QR 코드 조회 / 재발급 ─────────────────

    @GetMapping("/market/qr")
    public ResponseEntity<ApiResponse<MarketResponse>>
    getQr(
            @AuthenticationPrincipal
            CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                ApiResponse.ok(marketService.getMyMarket(
                        userDetails.getUserId())));
    }

    @PutMapping("/market/qr")
    public ResponseEntity<ApiResponse<MarketResponse>>
    reissueQr(
            @AuthenticationPrincipal
            CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                ApiResponse.ok(marketService.reissueQr(
                        userDetails.getUserId())));
    }

    // ── 가까운 시장 조회 (사용자용) ───────────

    @GetMapping("/market")
    public ResponseEntity<ApiResponse<List<MarketResponse>>>
    getNearestMarkets(
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        return ResponseEntity.ok(
                ApiResponse.ok(marketService.getNearestMarkets(
                        latitude, longitude)));
    }

    // ── 품목 목록 조회 ────────────────────────

    @GetMapping("/market/items")
    public ResponseEntity<ApiResponse<List<MarketItemResponse>>>
    getMarketItems(
            @AuthenticationPrincipal
            CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                ApiResponse.ok(marketService.getMarketItems(
                        userDetails.getUserId())));
    }

    // ── 품목 등록 ─────────────────────────────

    @PostMapping("/market/items")
    public ResponseEntity<ApiResponse<MarketItemResponse>>
    createMarketItem(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @RequestBody MarketItemCreateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(marketService.createMarketItem(
                        userDetails.getUserId(), request)));
    }

    // ── 품목 수정 ─────────────────────────────

    @PutMapping("/market/items/{itemId}")
    public ResponseEntity<ApiResponse<MarketItemResponse>>
    updateMarketItem(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @PathVariable Long itemId,
            @RequestBody MarketItemUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(marketService.updateMarketItem(
                        userDetails.getUserId(),
                        itemId, request)));
    }

    // ── 품목 삭제 ─────────────────────────────

    @DeleteMapping("/market/items/{itemId}")
    public ResponseEntity<ApiResponse<Void>>
    deleteMarketItem(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @PathVariable Long itemId) {
        marketService.deleteMarketItem(
                userDetails.getUserId(), itemId);
        return ResponseEntity.ok(
                ApiResponse.ok("품목이 삭제되었습니다", null));
    }

    // ── 할인 등록 ─────────────────────────────

    @PostMapping("/market/items/{itemId}/sale")
    public ResponseEntity<ApiResponse<MarketItemResponse>>
    startSale(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @PathVariable Long itemId,
            @RequestBody MarketItemSaleRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(marketService.startSale(
                        userDetails.getUserId(),
                        itemId, request)));
    }

    // ── 할인 취소 ─────────────────────────────

    @DeleteMapping("/market/items/{itemId}/sale")
    public ResponseEntity<ApiResponse<MarketItemResponse>>
    cancelSale(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(
                ApiResponse.ok(marketService.cancelSale(
                        userDetails.getUserId(), itemId)));
    }
}