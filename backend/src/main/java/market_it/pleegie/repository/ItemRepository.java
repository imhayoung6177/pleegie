package market_it.pleegie.repository;

import market_it.pleegie.domain.Item; // 아까 만든 Item 설계도를 가져옵니다.
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * ItemRepository는 상품 창고(DB)에 접근하는 '창고지기' 인터페이스입니다.
 */
@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    // 💡 JpaRepository를 상속받는 것만으로도
    // save(저장), findById(조회), delete(삭제) 기능을 공짜로 얻게 됩니다!
}