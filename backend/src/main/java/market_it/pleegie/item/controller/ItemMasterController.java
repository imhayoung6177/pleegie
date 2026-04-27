package market_it.pleegie.item.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.item.dto.ItemMasterResponse;
import market_it.pleegie.item.repository.ItemMasterRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/item-master")
@RequiredArgsConstructor
public class ItemMasterController {

    private final ItemMasterRepository itemMasterRepository;

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
}