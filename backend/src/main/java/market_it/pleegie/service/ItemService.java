package market_it.pleegie.service;

import market_it.pleegie.domain.Item;
import market_it.pleegie.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service // 1. 이 클래스는 비즈니스 로직을 담당하는 '서비스'임을 선언합니다.
@Transactional // 2. 로직 수행 중 하나라도 실패하면 전부 취소(Rollback)하는 안전장치입니다.
@RequiredArgsConstructor // 3. 아래 ItemRepository를 스프링이 자동으로 연결(주입)해줍니다.
public class ItemService {

    private final ItemRepository itemRepository;

    /**
     * 상품(재료) 등록 로직
     */
    public Long saveItem(Item item) {
        // 💡 나중에 여기서 "할인 시간이면 가격을 낮춰라" 같은 로직이 들어갑니다.
        itemRepository.save(item);
        return item.getId();
    }

    /**
     * 모든 상품 목록 조회 로직
     */
    @Transactional(readOnly = true) // 읽기 전용으로 설정하면 속도가 더 빠릅니다.
    public List<Item> findItems() {
        return itemRepository.findAll();
    }

    /**
     * 상품 하나만 상세 조회 로직
     */
    @Transactional(readOnly = true)
    public Item findOne(Long itemId) {
        return itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("해당 상품이 존재하지 않습니다."));
    }
}