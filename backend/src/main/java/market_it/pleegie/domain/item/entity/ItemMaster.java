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

    // [종빈 추가] 서비스 레이어에서 API 데이터를 가지고 객체를 만들기 위해 사용
    public ItemMaster(String name, String category) {
        this.name = name;
        this.category = category;
    }

    // [종빈 추가] 정적 팩토리 메서드 (관례적으로 많이 사용함)
    public static ItemMaster create(String name, String category) {
        ItemMaster itemMaster = new ItemMaster();
        itemMaster.name = name;
        itemMaster.category = category;
        return itemMaster;
    }
}
