package market_it.pleegie.notice.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.admin.entity.Admin;
import market_it.pleegie.notice.entity.Notice;

@Getter
@NoArgsConstructor
public class NoticeCreateRequest {

    private String targetType;  // USER / MARKET / ALL
    private String title;
    private String content;

    public Notice toEntity(Admin admin) {
        return Notice.builder()
                .admin(admin)
                .targetType(this.targetType)
                .title(this.title)
                .content(this.content)
                .build();
    }
}