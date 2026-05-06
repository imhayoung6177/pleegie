package market_it.pleegie.admin.controller;

import ch.qos.logback.classic.encoder.JsonEncoder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import market_it.pleegie.admin.dto.AdminLoginRequest;
import market_it.pleegie.admin.dto.AdminResponse;
import market_it.pleegie.admin.dto.AdminStatisticsResponse;
import market_it.pleegie.admin.service.AdminService;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.common.security.CustomAdminDetails;
import market_it.pleegie.common.security.CustomUserDetails;
import market_it.pleegie.notice.dto.NoticeCreateRequest;
import market_it.pleegie.notice.dto.NoticeResponse;
import market_it.pleegie.report.dto.ReportResponse;
import market_it.pleegie.report.service.ReportService;
import market_it.pleegie.user.dto.UserLoginResponse;
import market_it.pleegie.user.dto.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin") // [준호 추가] 클래스 상단에 이 한 줄을 추가하면 모든 메서드 주소 앞에 /api가 붙습니다!
public class AdminController {

    private final AdminService adminService;
    private final PasswordEncoder passwordEncoder;
    private final ReportService reportService; // 준호 추가

    // ── 관리자 로그인 ─────────────────────────

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserLoginResponse>>
    login(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.login(request)));
    }

    @GetMapping("/dashboard") // [준호 추가]
    public ResponseEntity<ApiResponse<Map<String, String>>> getDashboardInfo() {
        Map<String, String> data = Map.of("name", "관리자");

        return ResponseEntity.ok(ApiResponse.ok("대시보드 정보 조회 성공", data));
    }

    // ── 회원 관리 ─────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>>
    getAllUsers() {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.getAllUsers()));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<UserResponse>>
    updateUserStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.updateUserStatus(
                        userId, request.get("status"))));
    }

    // ── 사업자 관리 ───────────────────────────

    @GetMapping("/markets")
    public ResponseEntity<ApiResponse<List<UserResponse>>>
    getAllMarkets() {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.getAllMarkets()));
    }

    @PutMapping("/markets/{marketId}/approve")
    public ResponseEntity<ApiResponse<UserResponse>>
    approveMarket(@PathVariable Long marketId) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        adminService.approveMarket(marketId)));
    }

    @PutMapping("/markets/{marketId}/reject")
    public ResponseEntity<ApiResponse<UserResponse>>
    rejectMarket(@PathVariable Long marketId) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        adminService.rejectMarket(marketId)));
    }

    // ── 신고 관리 ─────────────────────────────

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<ReportResponse>>>
    getAllReports(
            @RequestParam(required = false) String status) {
        List<ReportResponse> reports = status != null
                ? adminService.getReportsByStatus(status)
                : adminService.getAllReports();
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }

    @PutMapping("/reports/{reportId}/status")
    public ResponseEntity<ApiResponse<ReportResponse>>
    updateReportStatus(
            @PathVariable Long reportId,
            @RequestBody Map<String, String> request) {
        // 프론트엔드에서 보낸 값(status)을 꺼냅니다. - 준호 추가
        // 예: "WARN", "BAN", "REJECT" 또는 "경고", "정지", "반려"
        String status = request.get("status");
        // 프론트엔드에서 보낸 '직접 입력한 메시지'를 꺼냅니다.
        // 리액트에서 window.prompt로 입력받은 글자가 여기 담겨 옵니다.
        String message = request.get("message");

        // 우리가 만든 알림 포함 로직을 호출합니다.
        reportService.processReportResult(reportId, status, message);

        return ResponseEntity.ok(
                ApiResponse.ok("신고 처리가 완료되었으며 알림이 발송되었습니다.", null)); // 준호 수정
    }

    // ── 공지 관리 ─────────────────────────────

    @GetMapping("/notices")
    public ResponseEntity<ApiResponse<List<NoticeResponse>>>
    getAllNotices() {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.getAllNotices()));
    }

    @PostMapping("/notices")
    public ResponseEntity<ApiResponse<NoticeResponse>>
    createNotice(
            @AuthenticationPrincipal
            CustomAdminDetails adminDetails,
            @Valid @RequestBody NoticeCreateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.createNotice(
                        adminDetails.getAdminId(), request)));
    }

    @PutMapping("/notices/{noticeId}")
    public ResponseEntity<ApiResponse<NoticeResponse>>
    updateNotice(
            @PathVariable Long noticeId,
            @Valid @RequestBody NoticeCreateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.updateNotice(
                        noticeId, request)));
    }

    @DeleteMapping("/notices/{noticeId}")
    public ResponseEntity<ApiResponse<Void>>
    deleteNotice(@PathVariable Long noticeId) {
        adminService.deleteNotice(noticeId);
        return ResponseEntity.ok(
                ApiResponse.ok("공지가 삭제되었습니다", null));
    }

    // ── 지역화폐 관리 ─────────────────────────

    @GetMapping("/local-currency")
    public ResponseEntity<ApiResponse<?>>
    getLocalCurrencyRequests(@RequestParam(required = false) String status) { // [준호 추가]
        return ResponseEntity.ok(
                ApiResponse.ok(adminService
                        .getLocalCurrencyRequests()));
    }

    @PutMapping("/local-currency/{logId}/approve")
    public ResponseEntity<ApiResponse<Void>>
    approveLocalCurrency(
            @PathVariable Long logId,
            @AuthenticationPrincipal
            CustomAdminDetails adminDetails) {
        adminService.approveLocalCurrency(
                logId, adminDetails.getAdminId());
        return ResponseEntity.ok(
                ApiResponse.ok("지역화폐가 승인되었습니다", null));
    }

    @PutMapping("/local-currency/{logId}/reject")
    public ResponseEntity<ApiResponse<Void>>
    rejectLocalCurrency(
            @PathVariable Long logId,
            @AuthenticationPrincipal
            CustomAdminDetails adminDetails) {
        adminService.rejectLocalCurrency(
                logId, adminDetails.getAdminId());
        return ResponseEntity.ok(
                ApiResponse.ok("지역화폐가 반려되었습니다", null));
    }



// ── 통계 관리 ───────────────────────── [준호 추가]

/**
 * [서비스 통계 조회]
 * 대시보드에 표시할 가입자 수, 인기 품목, 레시피 수 등을 반환합니다.
 * GET /admin/statistics
 */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<AdminStatisticsResponse>> getStatistics() {
        // AdminService에서 계산된 통계 꾸러미를 가져와서 응답합니다.
        return ResponseEntity.ok(
                ApiResponse.ok("서비스 통계 조회 성공", adminService.getStatistics()));
    }
}
