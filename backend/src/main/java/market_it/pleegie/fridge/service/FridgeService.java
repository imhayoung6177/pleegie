package market_it.pleegie.fridge.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import market_it.pleegie.common.client.PythonApiClient;
import market_it.pleegie.common.exception.CustomException;
import market_it.pleegie.common.exception.ErrorCode;
import market_it.pleegie.fridge.dto.FridgeItemCreateRequest;
import market_it.pleegie.fridge.dto.FridgeItemResponse;
import market_it.pleegie.fridge.dto.FridgeItemUpdateRequest;
import market_it.pleegie.fridge.entity.Fridge;
import market_it.pleegie.fridge.entity.FridgeItem;
import market_it.pleegie.fridge.repository.FridgeItemRepository;
import market_it.pleegie.fridge.repository.FridgeRepository;
import market_it.pleegie.item.entity.ItemMaster;
import market_it.pleegie.item.repository.ItemMasterRepository;
import market_it.pleegie.user.entity.User;
import market_it.pleegie.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FridgeService {

    private final FridgeRepository fridgeRepository;
    private final FridgeItemRepository fridgeItemRepository;
    private final ItemMasterRepository itemMasterRepository;
    private final UserRepository userRepository;
    private final PythonApiClient pythonApiClient;

    // ── 냉장고 조회 (없으면 자동 생성) ──────────

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Fridge getOrCreateFridge(Long userId) {
        return fridgeRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new CustomException(
                                    ErrorCode.USER_NOT_FOUND));
                    return fridgeRepository.save(
                            Fridge.builder().user(user).build());
                });
    }

    // ── 재료 전체 조회 (유통기한 임박 순) ────────
    @Transactional(readOnly = false)
    public List<FridgeItemResponse> getFridgeItems(Long userId) {
        Fridge fridge = getOrCreateFridge(userId);
        return fridgeItemRepository
                .findAllByFridgeIdOrderByExpAsc(fridge.getId())
                .stream()
                .map(FridgeItemResponse::from)
                .collect(Collectors.toList());
    }

    // ── 재료 추가 ─────────────────────────────

    @Transactional
    public FridgeItemResponse addFridgeItem(Long userId,
                                            FridgeItemCreateRequest request) {

        Fridge fridge = getOrCreateFridge(userId);

        ItemMaster itemMaster;

        if (request.getItemMasterId() != null) {
            // itemMasterId 있으면 기존대로 조회
            itemMaster = itemMasterRepository
                    .findById(request.getItemMasterId())
                    .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));
        } else {
            // itemMasterId 없으면 name으로 조회 or 신규 생성
            if (request.getName() == null || request.getName().isBlank()) {
                throw new CustomException(ErrorCode.INVALID_INPUT);
            }

            itemMaster = itemMasterRepository
                    .findByName(request.getName())
                    .orElseGet(() -> {
                        // 🔴 수정: newItem/saved로 분리
                        ItemMaster newItem = ItemMaster.builder()
                                .name(request.getName())
                                .category(request.getCategory() != null
                                        ? request.getCategory() : "기타")
                                .unit(request.getUnit() != null
                                        ? request.getUnit() : "개")
                                .build();

                        ItemMaster saved = itemMasterRepository.save(newItem);

                        pythonApiClient.addIngredient(saved);  // 🔴 saved 사용 가능
                        log.info("[FridgeService] ItemMaster 자동 생성: name={}, id={}",
                                saved.getName(), saved.getId());

                        return saved;
                    });
        }

        FridgeItem fridgeItem = request.toEntity(fridge, itemMaster);
        fridgeItemRepository.save(fridgeItem);

        return FridgeItemResponse.from(fridgeItem);
    }

    // ── 재료 수정 ─────────────────────────────

    @Transactional
    public FridgeItemResponse updateFridgeItem(Long userId,
                                               Long itemId, FridgeItemUpdateRequest request) {

        FridgeItem fridgeItem = getFridgeItemWithAuth(userId, itemId);

        fridgeItem.updateInfo(
                request.getQuantity(),
                request.getUnit(),
                request.getExp(),
                request.getPrice(),
                request.getCategory());

        return FridgeItemResponse.from(fridgeItem);
    }

    // ── 재료 삭제 ─────────────────────────────

    @Transactional
    public void deleteFridgeItem(Long userId, Long itemId) {
        FridgeItem fridgeItem = getFridgeItemWithAuth(userId, itemId);
        fridgeItemRepository.delete(fridgeItem);
    }

    // ── 유통기한 상태 업데이트 (스케줄러용) ──────

    @Transactional
    public void updateExpiryStatus() {
        LocalDate today = LocalDate.now();
        LocalDate nearExpiryDate = today.plusDays(3);

        // 만료된 재료 EXPIRED로 변경
        fridgeItemRepository.findExpiredItems(today)
                .forEach(item -> item.updateStatus("EXPIRED"));

        // 3일 이내 임박 재료 NEAR_EXPIRY로 변경
        fridgeItemRepository.findNearExpiryItems(
                        null, nearExpiryDate)
                .stream()
                .filter(item -> !item.getStatus().equals("EXPIRED"))
                .forEach(item -> item.updateStatus("NEAR_EXPIRY"));

        log.info("유통기한 상태 업데이트 완료 - 기준일: {}", today);
    }

    // ── 유통기한 임박 알림 (스케줄러용) ──────────

    @Transactional
    public List<FridgeItem> getUnnotifiedNearExpiryItems() {
        LocalDate targetDate = LocalDate.now().plusDays(3);
        return fridgeItemRepository
                .findNotNotifiedNearExpiryItems(targetDate);
    }

    // ── 내부 메서드 ───────────────────────────

    // 본인 재료인지 확인
    private FridgeItem getFridgeItemWithAuth(Long userId,
                                             Long itemId) {
        Fridge fridge = fridgeRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.FRIDGE_NOT_FOUND));

        FridgeItem fridgeItem = fridgeItemRepository
                .findById(itemId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.FRIDGE_ITEM_NOT_FOUND));

        // 본인 냉장고 재료인지 확인
        if (!fridgeItem.getFridge().getId()
                .equals(fridge.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        return fridgeItem;
    }
}