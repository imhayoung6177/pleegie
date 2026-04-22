package market_it.pleegie.controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import market_it.pleegie.domain.FridgeItemDTO;
import market_it.pleegie.domain.fridge.Entity.Fridge;
import market_it.pleegie.repository.FridgeRepository;
import market_it.pleegie.service.FridgeItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * FridgeItemController — 냉장고 재료 API
 * <p>
 * Base URL: /api/fridge
 * <p>
 * userId 처리 방식:
 * 로그인 시 세션에 저장된 "loginUserId" 를 꺼내서
 * → FridgeRepository.findByUser_Id() 로 Fridge 조회
 * → fridgeId 를 Service 에 전달
 * <p>
 * 프론트에서 fridgeId 를 직접 보내지 않아도 됨 (보안상 올바른 방식)
 */
@RestController
@RequestMapping("/api/fridge")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class FridgeItemController {

    private final FridgeItemService fridgeItemService;
    private final FridgeRepository fridgeRepository;

    /* ──────────────────────────────────────────
       공통 헬퍼: 세션 → userId → fridgeId

       세션에서 loginUserId 꺼냄
       → FridgeRepository.findByUser_Id() 로 Fridge 조회
       → fridgeId 반환

       예외:
       - 세션 없음 → IllegalStateException (401)
       - Fridge 없음 → IllegalArgumentException (400)
    ────────────────────────────────────────── */
    private Long getFridgeIdFromSession(HttpSession session) {

        // LoginApiController 에서 session.setAttribute("loginUserId", user.getId()) 로 저장함
        Long userId = (Long) session.getAttribute("loginUserId");

        if (userId == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }

        // Fridge.user 가 User 객체 참조이므로 findByUser_Id() 사용
        Fridge fridge = fridgeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "냉장고 정보가 없습니다. 관리자에게 문의하세요."));

        return fridge.getId();
    }

    /* ════════════════════════════════════════
       API 유사도 검색을 통한 재료 등록
       POST /api/fridge/api-add
    ════════════════════════════════════════ */
    @PostMapping("/api-add")
    public ResponseEntity<?> addBySimilarity(
            @RequestBody FridgeItemDTO.ExtractionRequest request,
            HttpSession session) {
        try {
            Long fridgeId = getFridgeIdFromSession(session);
            // 서비스에 구현한 addIngredientByApi 호출
            FridgeItemDTO.Response response =
                    fridgeItemService.addIngredientByApi(fridgeId, request.getUserInput());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /* ════════════════════════════════════════
       재료 등록
       POST /api/fridge

       요청 Body:
       {
         "itemMasterId": 1,
         "category": "VEGGIE",
         "exp": "2026-12-31",
         "price": 0
       }
    ════════════════════════════════════════ */
    @PostMapping
    public ResponseEntity<?> addIngredient(
            @RequestBody FridgeItemDTO.CreateRequest request,
            HttpSession session) {
        try {
            Long fridgeId = getFridgeIdFromSession(session);
            FridgeItemDTO.Response response = fridgeItemService.addIngredient(fridgeId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalStateException e) {
            // 로그인 안 한 경우
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());

        } catch (IllegalArgumentException e) {
            // 재료 없음, 중복 등
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /* ════════════════════════════════════════
       내 냉장고 재료 전체 조회
       GET /api/fridge
    ════════════════════════════════════════ */
    @GetMapping
    public ResponseEntity<?> getMyIngredients(HttpSession session) {
        try {
            Long fridgeId = getFridgeIdFromSession(session);
            List<FridgeItemDTO.Response> responses =
                    fridgeItemService.getIngredientsInFridge(fridgeId);
            return ResponseEntity.ok(responses);

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /* ════════════════════════════════════════
       유통기한 지난 재료 조회
       GET /api/fridge/expired
    ════════════════════════════════════════ */
    @GetMapping("/expired")
    public ResponseEntity<?> getExpiredIngredients(HttpSession session) {
        try {
            Long fridgeId = getFridgeIdFromSession(session);
            List<FridgeItemDTO.Response> responses =
                    fridgeItemService.getExpiredIngredients(fridgeId);
            return ResponseEntity.ok(responses);

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /* ════════════════════════════════════════
       냉장고 재료 개수 조회
       GET /api/fridge/count
    ════════════════════════════════════════ */
    @GetMapping("/count")
    public ResponseEntity<?> getFridgeItemCount(HttpSession session) {
        try {
            Long fridgeId = getFridgeIdFromSession(session);
            long count = fridgeItemService.getFridgeItemCount(fridgeId);
            return ResponseEntity.ok(count);

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /* ════════════════════════════════════════
       재료 수정
       PUT /api/fridge/{id}

       요청 Body (변경할 값만 보내면 됨):
       { "exp": "2026-06-30", "price": 2000 }
    ════════════════════════════════════════ */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateIngredient(
            @PathVariable Long id,
            @RequestBody FridgeItemDTO.UpdateRequest request) {
        try {
            FridgeItemDTO.Response response = fridgeItemService.updateIngredient(id, request);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /* ════════════════════════════════════════
       재료 삭제
       DELETE /api/fridge/{id}
    ════════════════════════════════════════ */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIngredient(@PathVariable Long id) {
        try {
            fridgeItemService.deleteIngredient(id);
            return ResponseEntity.noContent().build(); // 204 No Content

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}