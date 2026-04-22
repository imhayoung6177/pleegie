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
    private final SimilarityService similarityService;

    /**
     * 상품(재료) 등록 로직
     */
    public Long saveItem(Item item) {
        // [A] 유사도 검색 (Similarity Search)
        // 예: 상인이 "무우"라고 입력하면 API를 통해 표준어인 "무"를 찾아옵니다.
        String standardName = similarityService.findStandardName(item.getItemName());

        // [B] 데이터 보정
        // 표준 이름을 별도의 컬럼에 저장해두면 나중에 검색이 훨씬 정확해집니다.
        item.setItemName(standardName);

        // [C] 최종 저장 (Persistence)
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
     * 손님에게 보여줄 상품 상세 정보 (할인 가격 적용)
     */
    @Transactional(readOnly = true)
    public int getCurrentPrice(Long itemId) {
        // 1. DB에서 상품을 꺼내옵니다.
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("상품이 없어요!"));

        // 2. 아까 Item 엔티티에 만든 '할인 계산기'를 두드립니다.
        // 비유: 지금이 마감 세일 시간인지 시계를 보고 가격표를 새로 뽑는 과정입니다.
        return item.getDiscountedPrice();
    }
}