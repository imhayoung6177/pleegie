package market_it.pleegie.notice.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.notice.entity.Notice;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class NoticeResponse {

    private Long id;
    private String adminName;
    private String targetType;  // USER / MARKET / ALL
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static NoticeResponse from(Notice notice) {
        NoticeResponse res = new NoticeResponse();
        res.id = notice.getId();
        res.adminName = notice.getAdmin().getName();
        res.targetType = notice.getTargetType();
        res.title = notice.getTitle();
        res.content = notice.getContent();
        res.createdAt = notice.getCreatedAt();
        res.updatedAt = notice.getUpdatedAt();
        return res;
    }
}