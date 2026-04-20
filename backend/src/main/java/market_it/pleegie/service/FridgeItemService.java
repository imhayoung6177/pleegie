package market_it.pleegie.service;

import market_it.pleegie.domain.FridgeItem;
import market_it.pleegie.domain.FridgeItemDTO; // DTO 대문자 확인
import market_it.pleegie.repository.FridgeItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FridgeItemService {

    private final FridgeItemRepository fridgeItemRepository;

    /* ════════════════════════════════════════
       재료 등록
    ════════════════════════════════════════ */
    @Transactional
    public FridgeItemDTO.Response addIngredient(FridgeItemDTO.CreateRequest request) {
        // 1. DTO → Entity 변환
        FridgeItem item = request.toEntity();

        // 2. DB 저장
        FridgeItem saved = fridgeItemRepository.save(item);

        // 3. Entity → 응답 DTO 변환
        return FridgeItemDTO.Response.from(saved);
    }

    /* ════════════════════════════════════════
       특정 냉장고의 모든 재료 조회
    ════════════════════════════════════════ */
    @Transactional(readOnly = true)
    public List<FridgeItemDTO.Response> getIngredientsInFridge(Long fridgeId) {
        List<FridgeItem> items = fridgeItemRepository.findByFridgeId(fridgeId);

        return items.stream()
                .map(FridgeItemDTO.Response::from)
                .collect(Collectors.toList());
    }

    /* ════════════════════════════════════════
       유통기한 지난 재료 조회
    ════════════════════════════════════════ */
    @Transactional(readOnly = true)
    public List<FridgeItemDTO.Response> getExpiredIngredients(Long fridgeId) {
        List<FridgeItem> items = fridgeItemRepository.findExpiredItems(fridgeId);

        return items.stream()
                .map(FridgeItemDTO.Response::from)
                .collect(Collectors.toList());
    }

    /* ════════════════════════════════════════
       재료 정보 수정 (유통기한/가격/카테고리)
    ════════════════════════════════════════ */
    @Transactional
    public FridgeItemDTO.Response updateIngredient(Long itemId, FridgeItemDTO.UpdateRequest request) {

        // 1. 재료 존재 여부 확인
        FridgeItem item = fridgeItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("해당 재료를 찾을 수 없습니다. id=" + itemId));

        // 2. 전달된 값만 업데이트
        if (request.getExp() != null) {
            item.setExp(request.getExp());
        }
        if (request.getPrice() != null) {
            item.setPrice(request.getPrice());
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            item.setCategory(request.getCategory());
        }

        // JPA Dirty Checking으로 자동 반영
        return FridgeItemDTO.Response.from(item);
    }

    /* ════════════════════════════════════════
       재료 삭제 (진짜 삭제)
    ════════════════════════════════════════ */
    @Transactional
    public void deleteIngredient(Long itemId) {
        if (!fridgeItemRepository.existsById(itemId)) {
            throw new IllegalArgumentException("삭제하려는 재료가 존재하지 않습니다. id=" + itemId);
        }
        fridgeItemRepository.deleteById(itemId);
    }

    /* ════════════════════════════════════════
       냉장고 내 총 재료 개수
    ════════════════════════════════════════ */
    @Transactional(readOnly = true)
    public long getFridgeItemCount(Long fridgeId) {
        return fridgeItemRepository.countByFridgeId(fridgeId);
    }
}