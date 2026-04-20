package market_it.pleegie.controller;

import market_it.pleegie.domain.Item;
import market_it.pleegie.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // 1. JSON 데이터를 주고받는 '디지털 창구'임을 선언합니다.
@RequestMapping("/api/merchant/items") // 2. 모든 주소 앞에 이 경로가 붙습니다.
@RequiredArgsConstructor
public class MerchantItemController {

    private final ItemService itemService;

    /**
     * 🚀 상인의 재료(상품) 등록 창구
     * POST http://localhost:8080/api/merchant/items/new
     */
    @PostMapping("/new")
    public String createItem(@RequestBody Item item) {
        // 💡 리액트에서 보낸 '재료 정보' 뭉치를 서비스에게 넘겨서 저장합니다.
        itemService.saveItem(item);
        return "새로운 재료가 성공적으로 등록되었습니다!";
    }

    /**
     * 등록된 모든 재료 목록 보기 창구
     * GET http://localhost:8080/api/merchant/items
     */
    @GetMapping
    public List<Item> itemList() {
        // 💡 서비스에게 "저장된 재료들 싹 다 가져와!"라고 시킵니다.
        return itemService.findItems();
    }
}
