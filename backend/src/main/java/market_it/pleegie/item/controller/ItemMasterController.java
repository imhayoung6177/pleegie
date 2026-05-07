package market_it.pleegie.item.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import market_it.pleegie.common.client.PythonApiClient;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.item.dto.ItemMasterCreateRequest;
import market_it.pleegie.item.dto.ItemMasterResponse;
import market_it.pleegie.item.entity.ItemMaster;
import market_it.pleegie.item.repository.ItemMasterRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/item-master")
@RequiredArgsConstructor
public class ItemMasterController {

    private final ItemMasterRepository itemMasterRepository;
    private final PythonApiClient pythonApiClient;

    // 재료 전체 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<ItemMasterResponse>>>
    getAllItems() {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        itemMasterRepository.findAll()
                                .stream()
                                .map(ItemMasterResponse::from)
                                .collect(Collectors.toList())));
    }

    // 재료 자동완성 검색
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ItemMasterResponse>>>
    searchItems(@RequestParam String name) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        itemMasterRepository
                                .findByNameContaining(name)
                                .stream()
                                .map(ItemMasterResponse::from)
                                .collect(Collectors.toList())));
    }

    // 카테고리별 조회
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<ItemMasterResponse>>>
    getItemsByCategory(
            @PathVariable String category) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        itemMasterRepository
                                .findAllByCategory(category)
                                .stream()
                                .map(ItemMasterResponse::from)
                                .collect(Collectors.toList())));
    }

    // 재료 신규 생성
    @PostMapping
    public ResponseEntity<ApiResponse<ItemMasterResponse>>
    createItem(@RequestBody ItemMasterCreateRequest request) {
        // 같은 이름이 이미 있으면 기존 것 반환 (중복 생성 방지)
        return itemMasterRepository.findByName(request.getName())
                .map(existing -> ResponseEntity.ok(
                        ApiResponse.ok(ItemMasterResponse.from(existing))))
                .orElseGet(() -> {
                    ItemMaster saved = itemMasterRepository.save(
                            ItemMaster.builder()
                                    .name(request.getName())
                                    .category(request.getCategory() != null
                                    ? request.getCategory() : "기타")
                                    .unit(request.getUnit() != null
                                    ? request.getUnit() : "개")
                                    .build());

                    pythonApiClient.addIngredient(saved);

                    return ResponseEntity.ok(
                            ApiResponse.ok(ItemMasterResponse.from(saved)));
                });
    }
}