package market_it.pleegie.notification.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.common.security.CustomUserDetails;
import market_it.pleegie.notification.dto.NotificationResponse;
import market_it.pleegie.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/notifications") //  설계 원칙: 복수형 명사 사용
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 1. 내 알림 목록 조회
     * GET http://localhost:8080/user/notifications?userId=1
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.ok(notificationService.getMyNotifications(userDetails.getUserId())));
    }

    /**
     * 2. 특정 알림 읽음 처리 (진동 벨 끄기)
     * PATCH http://localhost:8080/user/notifications/{id}/read
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> readNotification(@AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        // 특정 알림을 '읽음' 상태로 바꿉니다.
        notificationService.readNotification(userDetails.getUserId(), id);

        return ResponseEntity.ok(ApiResponse.ok("알림 읽음 처리 완료", null));
    }

    /**
     * 3. 모든 알림 한꺼번에 읽음 처리 (마스터 스위치)
     * PATCH http://localhost:8080/user/notifications/read-all?userId=1
     */
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> readAllNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.readAllNotifications(userDetails.getUserId());

        return ResponseEntity.ok(ApiResponse.ok("모든 알림 읽음 처리 완료", null));
    }
}