package market_it.pleegie.notification.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.exception.CustomException;
import market_it.pleegie.common.exception.ErrorCode;
import market_it.pleegie.notification.dto.NotificationResponse;
import market_it.pleegie.notification.entity.Notification;
import market_it.pleegie.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * 특정 사용자의 알림 목록 조회
     */
    public List<NotificationResponse> getMyNotifications(Long userId) {
        // 창고지기에게 유저 ID로 알림들을 가져오라고 시킵니다.
        return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 알림 읽음 처리 (진동 벨 끄기)
     */
    @Transactional
    public void readNotification(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));

        // 본인 알림인지 확인
        if (!notification.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        notification.read(); // 엔티티의 비즈니스 로직 호출
    }

    /**
     * 모든 알림 읽음 처리
     */
    @Transactional
    public void readAllNotifications(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }
}