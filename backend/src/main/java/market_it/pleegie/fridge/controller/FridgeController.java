package market_it.pleegie.fridge.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.common.security.CustomUserDetails;
import market_it.pleegie.fridge.dto.FridgeItemCreateRequest;
import market_it.pleegie.fridge.dto.FridgeItemResponse;
import market_it.pleegie.fridge.dto.FridgeItemUpdateRequest;
import market_it.pleegie.fridge.service.FridgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FridgeController {

    private final FridgeService fridgeService;

    // ── 재료 전체 조회 ────────────────────────

    @GetMapping("/user/fridge/items")
    public ResponseEntity<ApiResponse<List<FridgeItemResponse>>>
    getFridgeItems(
            @AuthenticationPrincipal
            CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(
                fridgeService.getFridgeItems(
                        userDetails.getUserId())));
    }

    // ── 재료 추가 ─────────────────────────────

    @PostMapping("/user/fridge/items")
    public ResponseEntity<ApiResponse<FridgeItemResponse>>
    addFridgeItem(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @Valid @RequestBody
            FridgeItemCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                fridgeService.addFridgeItem(
                        userDetails.getUserId(), request)));
    }

    // ── 재료 수정 ─────────────────────────────

    @PutMapping("/user/fridge/items/{itemId}")
    public ResponseEntity<ApiResponse<FridgeItemResponse>>
    updateFridgeItem(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @PathVariable Long itemId,
            @Valid @RequestBody
            FridgeItemUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                fridgeService.updateFridgeItem(
                        userDetails.getUserId(),
                        itemId, request)));
    }

    // ── 재료 삭제 ─────────────────────────────

    @DeleteMapping("/user/fridge/items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteFridgeItem(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @PathVariable Long itemId) {
        fridgeService.deleteFridgeItem(
                userDetails.getUserId(), itemId);
        return ResponseEntity.ok(
                ApiResponse.ok("재료가 삭제되었습니다", null));
    }
}