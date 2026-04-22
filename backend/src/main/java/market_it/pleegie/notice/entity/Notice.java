package market_it.pleegie.notice.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.admin.entity.Admin;
import market_it.pleegie.common.BaseEntity;

@Entity
@Table(name = "notice")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Notice extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;

    @Column(nullable = false)
    private String targetType;          // USER / MARKET / ALL

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    public void update(String title,
                       String content,
                       String targetType) {
        if (title != null) this.title = title;
        if (content != null) this.content = content;
        if (targetType != null) this.targetType = targetType;
    }
}