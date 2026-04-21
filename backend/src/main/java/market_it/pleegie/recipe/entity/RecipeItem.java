package market_it.pleegie.recipe.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.item.entity.ItemMaster;

@Entity
@Table(name = "recipe_item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RecipeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_master_id", nullable = false)
    private ItemMaster itemMaster;

    private String name;
    private String category;
    private Float quantity;             // 필요 수량
    private String unit;
}