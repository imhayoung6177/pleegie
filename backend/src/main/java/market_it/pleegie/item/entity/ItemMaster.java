package market_it.pleegie.item.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "item_master")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ItemMaster {

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