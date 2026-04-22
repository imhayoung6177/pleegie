package market_it.pleegie.stamp.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.coupon.entity.UserCoupon;
import market_it.pleegie.market.entity.Market;
import market_it.pleegie.user.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "stamp",
        indexes = @Index(name = "stamp_index_0",
                columnList = "user_id, market_id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Stamp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    // 어느 쿠폰에 찍힌 스탬프인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_coupon_id", nullable = false)
    private UserCoupon userCoupon;

    @Builder.Default
    private LocalDateTime stampedAt = LocalDateTime.now(); // 1회 방문 = 1 row
}