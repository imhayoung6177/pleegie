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

    // [추가] 부모인 Recipe와의 N:1 관계 설정
    // 부모 클래스(Recipe)에서 mappedBy="recipe"라고 이름을 지었기 때문에
    // 여기서도 반드시 변수명을 'recipe'로 똑같이 맞춰야 합니다!
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_master_id", nullable = false)
    private ItemMaster itemMaster; // 재료 마스터 정보

    private String name; // 마스터 외에 별도로 부르는 이름
    private String category; // 재료 카테고리
}
