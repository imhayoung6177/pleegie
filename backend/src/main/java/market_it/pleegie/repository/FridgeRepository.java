package market_it.pleegie.repository;

import market_it.pleegie.domain.fridge.Entity.Fridge;
import market_it.pleegie.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * FridgeRepository
 *
 * ✅ 핵심 주의사항:
 * Fridge 엔티티가 @OneToOne User 객체로 연결되어 있기 때문에
 * findByUserId() 가 아니라 findByUser_Id() 를 써야 합니다.
 *
 * JPA 메서드 이름 규칙:
 * Fridge.user.id 를 기준으로 조회할 때 → findByUser_Id(Long userId)
 *             ↑필드명  ↑연관객체의 필드명
 */
public interface FridgeRepository extends JpaRepository<Fridge, Long> {

    // userId 로 냉장고 찾기
    Optional<Fridge> findByUser_Id(Long userId);

    // User 객체로 냉장고 찾기
    Optional<Fridge> findByUser(User user);

    // 중복 생성 방지용
    boolean existsByUser_Id(Long userId);
}