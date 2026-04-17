package market_it.pleegie.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "fridge_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FridgeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // SQL: fridge_id BIGINT NOT NULL
    @Column(name = "fridge_id", nullable = false)
    private Long fridgeId;

    // SQL: market_id BIGINT (선택)
    @Column(name = "market_id")
    private Long marketId;

    // SQL: item_master_id BIGINT NOT NULL
    @Column(name = "item_master_id", nullable = false)
    private Long itemMasterId;

    // SQL: category VARCHAR(50)
    @Column(length = 50)
    private String category;

    // SQL: exp DATE (유통기한)
    @Column(name = "exp")
    private LocalDate exp;

    // SQL: price INT
    private Integer price;

    // SQL: image_url TEXT
    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;
}