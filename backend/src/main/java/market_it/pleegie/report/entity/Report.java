package market_it.pleegie.report.entity;

import jakarta.persistence.*;
import lombok.*;
import market_it.pleegie.common.BaseEntity;
import market_it.pleegie.user.entity.User;

@Entity
@Table(name = "report")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Report extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writer_id", nullable = false)
    private User writer;

    private String targetType;          // USER / MARKET
    private Long targetId;              // 신고 대상 ID
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    private String status = "PENDING";  // PENDING / IN_PROGRESS / RESOLVED

    public void updateStatus(String status) {
        this.status = status;
    }
}