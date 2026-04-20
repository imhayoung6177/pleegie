package market_it.pleegie.domain.market.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Market {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String marketName; // 시장(가게) 이름

    private String address;    // 시장 위치
}