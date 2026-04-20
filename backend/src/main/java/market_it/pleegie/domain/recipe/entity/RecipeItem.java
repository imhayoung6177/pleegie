package market_it.pleegie.domain.recipe.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import market_it.pleegie.domain.BaseEntity;
import market_it.pleegie.domain.item.entity.ItemMaster;

@Entity
@Data
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecipeItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ 이 부분이 추가되어야 합니다!
    // Recipe 엔티티의 mappedBy = "recipe"와 이름이 똑같아야 합니다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_master_id", nullable = false)
    private ItemMaster itemMaster; // 재료 마스터 정보

    private String name; // 마스터 외에 별도로 부르는 이름
    private String category; // 재료 카테고리
}
