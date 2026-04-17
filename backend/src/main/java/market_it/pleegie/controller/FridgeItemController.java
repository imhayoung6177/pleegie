package market_it.pleegie.controller;

import market_it.pleegie.domain.FridgeItemDTO;
import market_it.pleegie.service.FridgeItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * FridgeItemController — 냉장고 재료 API 컨트롤러 (최신 스키마 및 DTO 반영)
 */
@RestController
@RequestMapping("/api/fridge")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FridgeItemController {

    private final FridgeItemService fridgeItemService;

    /* ════════════════════════════════════════
       재료 등록
       POST /api/fridge
    ════════════════════════════════════════ */
    @PostMapping
    public ResponseEntity<FridgeItemDTO.Response> addIngredient(
            @RequestBody FridgeItemDTO.CreateRequest request) {

        // 서비스의 addIngredient는 이제 DTO 내부의 fridgeId와 itemMasterId를 사용합니다.
        FridgeItemDTO.Response response = fridgeItemService.addIngredient(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /* ════════════════════════════════════════
       특정 냉장고의 재료 전체 조회
       GET /api/fridge/{fridgeId}
    ════════════════════════════════════════ */
    @GetMapping("/{fridgeId}")
    public ResponseEntity<List<FridgeItemDTO.Response>> getIngredients(
            @PathVariable Long fridgeId) {

        List<FridgeItemDTO.Response> responses = fridgeItemService.getIngredientsInFridge(fridgeId);

        return ResponseEntity.ok(responses);
    }

    /* ════════════════════════════════════════
       유통기한 지난 재료 조회
       GET /api/fridge/{fridgeId}/expired
    ════════════════════════════════════════ */
    @GetMapping("/{fridgeId}/expired")
    public ResponseEntity<List<FridgeItemDTO.Response>> getExpiredIngredients(
            @PathVariable Long fridgeId) {

        List<FridgeItemDTO.Response> responses = fridgeItemService.getExpiredIngredients(fridgeId);

        return ResponseEntity.ok(responses);
    }

    /* ════════════════════════════════════════
       재료 수정 (유통기한/가격/카테고리 등)
       PUT /api/fridge/{id}
    ════════════════════════════════════════ */
    @PutMapping("/{id}")
    public ResponseEntity<FridgeItemDTO.Response> updateIngredient(
            @PathVariable Long id,
            @RequestBody FridgeItemDTO.UpdateRequest request) {

        FridgeItemDTO.Response response = fridgeItemService.updateIngredient(id, request);

        return ResponseEntity.ok(response);
    }

    /* ════════════════════════════════════════
       재료 삭제 (진짜 삭제)
       DELETE /api/fridge/{id}
    ════════════════════════════════════════ */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIngredient(@PathVariable Long id) {

        fridgeItemService.deleteIngredient(id);

        return ResponseEntity.noContent().build();
    }

    /* ════════════════════════════════════════
       보관 중인 재료 개수 조회
       GET /api/fridge/{fridgeId}/count
    ════════════════════════════════════════ */
    @GetMapping("/{fridgeId}/count")
    public ResponseEntity<Long> getFridgeItemCount(@PathVariable Long fridgeId) {

        long count = fridgeItemService.getFridgeItemCount(fridgeId);
        return ResponseEntity.ok(count);
    }

    /* ════════════════════════════════════════
       예외 처리
    ════════════════════════════════════════ */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
}