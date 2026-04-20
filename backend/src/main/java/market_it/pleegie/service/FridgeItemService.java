package market_it.pleegie.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.domain.FridgeItemDTO;
import market_it.pleegie.domain.fridge.Entity.Fridge;
import market_it.pleegie.domain.fridge.Entity.FridgeItem;
import market_it.pleegie.domain.item.entity.ItemMaster;
import market_it.pleegie.repository.fridge.FridgeItemRepository;
import market_it.pleegie.repository.FridgeRepository;
import market_it.pleegie.repository.ItemMasterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FridgeItemService {

    private final FridgeItemRepository fridgeItemRepository;
    private final FridgeRepository     fridgeRepository;
    private final ItemMasterRepository itemMasterRepository;

    /* ════════════════════════════════════════
       재료 등록 (POST)
       - 마켓 기능은 사용하지 않으므로 null로 처리합니다.
    ════════════════════════════════════════ */
    @Transactional
    public FridgeItemDTO.Response addIngredient(Long fridgeId, FridgeItemDTO.CreateRequest request) {

        // 1. 내 냉장고 주인 확인: DB에 존재하는 냉장고인지 확인
        Fridge fridge = fridgeRepository.findById(fridgeId)
                .orElseThrow(() -> new IllegalArgumentException("냉장고를 찾을 수 없습니다."));

        // 2. 재료 정보 확인: 등록하려는 재료가 표준 사전에 있는지 확인
        ItemMaster itemMaster = itemMasterRepository.findById(request.getItemMasterId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 재료입니다."));

        // 3. 중복 체크: 내 냉장고에 이미 같은 재료가 있는지 확인
        boolean exists = fridgeItemRepository.existsByFridge_IdAndItemMaster_Id(fridgeId, request.getItemMasterId());
        if (exists) {
            throw new IllegalArgumentException("이미 냉장고에 등록된 재료입니다.");
        }

        // 4. 엔티티 생성: 마켓(3번째 인자)은 무조건 null을 전달하여 무시합니다.
        FridgeItem fridgeItem = FridgeItem.create(
                fridge,
                itemMaster,
                null,                   // ◀ Market 위치에 null 입력
                request.getCategory(),
                request.getExp(),
                request.getPrice(),
                request.getImageUrl()
        );

        // 5. DB 저장 및 DTO 변환 반환
        FridgeItem saved = fridgeItemRepository.save(fridgeItem);
        return FridgeItemDTO.Response.from(saved);
    }

    /* ════════════════════════════════════════
       내 냉장고 재료 전체 조회 (GET)
    ════════════════════════════════════════ */
    @Transactional(readOnly = true)
    public List<FridgeItemDTO.Response> getIngredientsInFridge(Long fridgeId) {
        // DB에서 꺼내온 Entity 리스트를 리액트용 DTO 리스트로 변환
        return fridgeItemRepository.findByFridge_Id(fridgeId)
                .stream()
                .map(FridgeItemDTO.Response::from)
                .collect(Collectors.toList());
    }

    /* ════════════════════════════════════════
       재료 정보 수정 (PUT)
    ════════════════════════════════════════ */
    @Transactional
    public FridgeItemDTO.Response updateIngredient(Long itemId, FridgeItemDTO.UpdateRequest request) {
        FridgeItem item = fridgeItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("재료를 찾을 수 없습니다."));

        // 사용자가 수정한 값이 있을 때만 교체 (Dirty Checking)
        if (request.getExp() != null) item.setExp(request.getExp());
        if (request.getPrice() != null) item.setPrice(request.getPrice());
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            item.setCategory(request.getCategory());
        }

        return FridgeItemDTO.Response.from(item);
    }

    /* ════════════════════════════════════════
       재료 삭제 (DELETE)
    ════════════════════════════════════════ */
    @Transactional
    public void deleteIngredient(Long itemId) {
        FridgeItem item = fridgeItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 재료가 없습니다. id=" + itemId));
        fridgeItemRepository.delete(item);
    }

    /* ════════════════════════════════════════
       냉장고 재료 개수 조회
    ════════════════════════════════════════ */
    @Transactional(readOnly = true)
    public long getFridgeItemCount(Long fridgeId) {
        return fridgeItemRepository.countByFridge_Id(fridgeId);
    }

    /* ════════════════════════════════════════
   유통기한 지난 재료 조회 (추가된 기능)
════════════════════════════════════════ */
    @Transactional(readOnly = true)
    public List<FridgeItemDTO.Response> getExpiredIngredients(Long fridgeId) {
        // Repository에서 유통기한이 지난 항목들을 찾아옴
        return fridgeItemRepository.findExpiredItems(fridgeId)
                .stream()
                .map(FridgeItemDTO.Response::from) // Entity를 Response DTO로 변환
                .collect(Collectors.toList());
    }
}