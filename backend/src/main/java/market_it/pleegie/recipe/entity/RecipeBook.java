package market_it.pleegie.recipe.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.common.BaseEntity;
import market_it.pleegie.user.entity.User;

@Entity
@Table(name = "recipe_book")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RecipeBook extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // LLM 응답 저장용 필드
    @Column(nullable = false)
    private String title; // 레시피 제목

    @Column(columnDefinition = "TEXT")
    private String description; // 레시피 설명

    @Column(columnDefinition = "TEXT")
    private String ingredients; // 재료 목록 (JSON 문자열)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;
}