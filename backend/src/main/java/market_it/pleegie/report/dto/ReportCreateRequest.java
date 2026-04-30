package market_it.pleegie.report.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.report.entity.Report;
import market_it.pleegie.user.entity.User;

@Getter
@NoArgsConstructor
public class ReportCreateRequest {

    private String title;
    private String content;

    public Report toEntity(User writer) {
        return Report.builder()
                .writer(writer)
                .title(this.title)
                .content(this.content)
                .build();
    }
}