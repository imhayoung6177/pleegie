package market_it.pleegie.report.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.report.entity.Report;
import market_it.pleegie.user.entity.User;

@Getter
@NoArgsConstructor
public class ReportCreateRequest {

    private String targetType;  // USER / MARKET
    private Long targetId;      // 신고 대상 ID
    private String title;
    private String content;

    public Report toEntity(User writer) {
        return Report.builder()
                .writer(writer)
                .targetType(this.targetType)
                .targetId(this.targetId)
                .title(this.title)
                .content(this.content)
                .build();
    }
}