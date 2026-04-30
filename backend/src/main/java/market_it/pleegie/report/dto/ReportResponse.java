package market_it.pleegie.report.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.report.entity.Report;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class ReportResponse {

    private Long id;
    private Long writerId;
    private String writerName;
    private String title;
    private String content;
    private String status;      // PENDING / IN_PROGRESS / RESOLVED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReportResponse from(Report report) {
        ReportResponse res = new ReportResponse();
        res.id = report.getId();
        res.writerId = report.getWriter().getId();
        res.writerName = report.getWriter().getName();
        res.title = report.getTitle();
        res.content = report.getContent();
        res.status = report.getStatus();
        res.createdAt = report.getCreatedAt();
        res.updatedAt = report.getUpdatedAt();
        return res;
    }
}