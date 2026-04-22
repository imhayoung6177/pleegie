package market_it.pleegie.notification.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.ApiResponse;
import market_it.pleegie.notification.dto.NotificationResponse;
import market_it.pleegie.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/notifications") // ✅ 설계 원칙: 복수형 명사 사용
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 1. 내 알림 목록 조회
     * GET http://localhost:8080/user/notifications?userId=1
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @RequestParam Long userId) {

        List<NotificationResponse> responses = notificationService.getMyNotifications(userId);

        return ResponseEntity.ok(ApiResponse.ok("알림 목록 조회 성공", responses));
    }

    /**
     * 2. 특정 알림 읽음 처리 (진동 벨 끄기)
     * PATCH http://localhost:8080/user/notifications/{id}/read
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> readNotification(@PathVariable Long id) {
        // 특정 알림을 '읽음' 상태로 바꿉니다.
        notificationService.readNotification(id);

        return ResponseEntity.ok(ApiResponse.ok("알림 읽음 처리 완료", null));
    }

    /**
     * 3. 모든 알림 한꺼번에 읽음 처리 (마스터 스위치)
     * PATCH http://localhost:8080/user/notifications/read-all?userId=1
     */
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> readAllNotifications(@RequestParam Long userId) {
        notificationService.readAllNotifications(userId);

        return ResponseEntity.ok(ApiResponse.ok("모든 알림 읽음 처리 완료", null));
    }
}