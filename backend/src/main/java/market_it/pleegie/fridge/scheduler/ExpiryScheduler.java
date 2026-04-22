package market_it.pleegie.fridge.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import market_it.pleegie.fridge.entity.FridgeItem;
import market_it.pleegie.fridge.service.FridgeService;
import market_it.pleegie.notification.entity.Notification;
import market_it.pleegie.notification.repository.NotificationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExpiryScheduler {

    private final FridgeService fridgeService;
    private final NotificationRepository notificationRepository;

    // 매일 자정 실행
    @Scheduled(cron = "0 0 0 * * *")
    public void updateExpiryStatus() {
        log.info("유통기한 스케줄러 시작");
        fridgeService.updateExpiryStatus();
    }

    // 매일 오전 9시 알림 발송
    @Scheduled(cron = "0 0 9 * * *")
    public void sendExpiryNotification() {
        List<FridgeItem> items = fridgeService
                .getUnnotifiedNearExpiryItems();

        items.forEach(item -> {
            // 알림 생성
            notificationRepository.save(
                    Notification.builder()
                            .user(item.getFridge().getUser())
                            .type("EXPIRY_ALERT")
                            .message(item.getItemMaster().getName()
                                    + "의 유통기한이 3일 이내입니다.")
                            .build());

            // 알림 발송 완료 표시
            item.markNotified();
        });

        log.info("유통기한 임박 알림 발송 완료 - {}건", items.size());
    }
}