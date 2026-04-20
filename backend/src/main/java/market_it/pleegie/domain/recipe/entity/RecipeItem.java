package market_it.pleegie.domain.recipe.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.domain.BaseEntity;
import market_it.pleegie.domain.item.entity.ItemMaster;

@Entity
@Data
@Builder
@AllArgsConstructor // Builder를 쓰기위한 모든 필드를 인자로 받는 생성자
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecipeItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_master_id", nullable = false)
    private ItemMaster itemMaster; // 재료 마스터 정보

    private String name; // 마스터 외에 별도로 부르는 이름
    private String category; // 재료 카테고리
}
