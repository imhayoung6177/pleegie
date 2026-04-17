package market_it.pleegie.domain.item.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import market_it.pleegie.domain.BaseEntity;

@Entity
@Data
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ItemMaster extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String unit;

    @Column(length = 50)
    private String category;
}
