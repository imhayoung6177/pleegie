package market_it.pleegie.item.repository;

import market_it.pleegie.item.entity.ItemMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemMasterRepository
        extends JpaRepository<ItemMaster, Long> {

    // 이름으로 정확히 조회
    Optional<ItemMaster> findByName(String name);

    // 이름으로 유사 검색
    List<ItemMaster> findByNameContaining(String name);

    // 카테고리로 조회
    List<ItemMaster> findAllByCategory(String category);

    // 이름 존재 여부 확인
    boolean existsByName(String name);
}