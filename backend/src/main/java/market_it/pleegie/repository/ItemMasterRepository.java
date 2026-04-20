package market_it.pleegie.repository;

import market_it.pleegie.domain.item.entity.ItemMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemMasterRepository extends JpaRepository<ItemMaster, Long> {
    // 필요한 조회 메서드가 있다면 여기에 추가
}