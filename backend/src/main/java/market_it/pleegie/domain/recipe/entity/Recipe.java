package market_it.pleegie.domain.recipe.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.domain.BaseEntity;
import market_it.pleegie.domain.user.User;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@AllArgsConstructor // Builder를 쓰기위한 모든 필드를 인자로 받는 생성자
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Recipe extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 작성자

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content; // 조리 방법이나 설명

    // 레시피에 포함된 재료 리스트
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeItem> recipeItems = new ArrayList<>();
}
