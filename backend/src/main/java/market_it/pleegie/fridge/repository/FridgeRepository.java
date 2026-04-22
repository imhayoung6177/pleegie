package market_it.pleegie.fridge.repository;

import market_it.pleegie.fridge.entity.Fridge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FridgeRepository extends JpaRepository<Fridge, Long> {

    // 유저 ID로 냉장고 조회 (유저당 냉장고 1개)
    Optional<Fridge> findByUserId(Long userId);

    // 냉장고 존재 여부 확인
    boolean existsByUserId(Long userId);
}