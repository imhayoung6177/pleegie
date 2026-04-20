package market_it.pleegie.domain.fridge.Entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import market_it.pleegie.domain.BaseEntity;
import market_it.pleegie.domain.user.User;

@Entity
@Data
@NoArgsConstructor
        //(access = AccessLevel.PROTECTED)
public class Fridge extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
