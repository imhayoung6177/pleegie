package market_it.pleegie.admin.controller;

import ch.qos.logback.classic.encoder.JsonEncoder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import market_it.pleegie.admin.dto.AdminLoginRequest;
import market_it.pleegie.admin.service.AdminService;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.common.security.CustomAdminDetails;
import market_it.pleegie.common.security.CustomUserDetails;
import market_it.pleegie.notice.dto.NoticeCreateRequest;
import market_it.pleegie.notice.dto.NoticeResponse;
import market_it.pleegie.report.dto.ReportResponse;
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
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.updateReportStatus(
                        reportId, request.get("status"))));
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
    getLocalCurrencyRequests() {
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

    @GetMapping("/hash")
    public ResponseEntity<String> hash() {
        return ResponseEntity.ok(passwordEncoder.encode("admin"));
    }
}