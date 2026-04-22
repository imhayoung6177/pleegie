package market_it.pleegie.money.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.cart.entity.Cart;
import market_it.pleegie.user.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "money_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MoneyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 장바구니 삭제 시 가계부 기록 유지 → SET NULL
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id",
            foreignKey = @ForeignKey(name = "fk_money_log_cart"))
    private Cart cart;

    private String title;               // 구매 항목명 (수기 입력 시 필수)
    private Integer total;
    private String category;            // 식비 / 생활비 등
    private String memo;

    @Builder.Default
    private LocalDateTime purchaseDate = LocalDateTime.now();

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}