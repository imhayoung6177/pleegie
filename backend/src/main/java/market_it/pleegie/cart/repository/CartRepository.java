package market_it.pleegie.cart.repository;

import market_it.pleegie.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CartRepository extends JpaRepository<Cart, Long> {

    // 유저 ID로 장바구니 전체 조회
    List<Cart> findAllByUserId(Long userId);

    // 유저 ID + 상태로 조회 (PENDING / PURCHASED)
    List<Cart> findAllByUserIdAndStatus(Long userId, String status);

    // 유저 ID + 장바구니 ID 목록으로 조회 (구매 처리 시)
    @Query("""
            SELECT c FROM Cart c
            WHERE c.user.id = :userId
            AND c.id IN :cartIds
            AND c.status = 'PENDING'
            """)
    List<Cart> findPendingCartsByIds(
            @Param("userId") Long userId,
            @Param("cartIds") List<Long> cartIds);

    // 시장 품목 ID로 장바구니 조회
    // (시장 품목 삭제 전 장바구니에 있는지 확인)
    List<Cart> findAllByMarketItemId(Long marketItemId);

    // 유저의 미구매 장바구니 총액 조회
    @Query("""
            SELECT SUM(c.price * c.quantity)
            FROM Cart c
            WHERE c.user.id = :userId
            AND c.status = 'PENDING'
            """)
    Integer sumPendingCartTotal(@Param("userId") Long userId);
}