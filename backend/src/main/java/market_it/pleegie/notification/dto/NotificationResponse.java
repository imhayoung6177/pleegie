package market_it.pleegie.notification.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.notification.entity.Notification;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class NotificationResponse {

    private Long id;
    private Long userId;
    private String type;        // EXPIRY_ALERT / DISCOUNT_ALERT / STAMP_COMPLETE / NOTICE
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification notification) {
        NotificationResponse res = new NotificationResponse();
        res.id = notification.getId();
        res.userId = notification.getUser().getId();
        res.type = notification.getType();
        res.message = notification.getMessage();
        res.isRead = notification.getIsRead();
        res.createdAt = notification.getCreatedAt();
        return res;
    }
}