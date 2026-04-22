package market_it.pleegie.admin.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import market_it.pleegie.admin.dto.AdminLoginRequest;
import market_it.pleegie.admin.service.AdminService;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.common.security.CustomUserDetails;
import market_it.pleegie.notice.dto.NoticeCreateRequest;
import market_it.pleegie.notice.dto.NoticeResponse;
import market_it.pleegie.report.dto.ReportResponse;
import market_it.pleegie.user.dto.UserLoginResponse;
import market_it.pleegie.user.dto.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ── 관리자 로그인 ─────────────────────────

    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse<UserLoginResponse>>
    login(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.login(request)));
    }

    // ── 회원 관리 ─────────────────────────────

    @GetMapping("/admin/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>>
    getAllUsers() {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.getAllUsers()));
    }

    @PutMapping("/admin/users/{userId}/status")
    public ResponseEntity<ApiResponse<UserResponse>>
    updateUserStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.updateUserStatus(
                        userId, request.get("status"))));
    }

    // ── 사업자 관리 ───────────────────────────

    @GetMapping("/admin/markets")
    public ResponseEntity<ApiResponse<List<UserResponse>>>
    getAllMarkets() {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.getAllMarkets()));
    }

    @PutMapping("/admin/markets/{marketId}/approve")
    public ResponseEntity<ApiResponse<UserResponse>>
    approveMarket(@PathVariable Long marketId) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        adminService.approveMarket(marketId)));
    }

    @PutMapping("/admin/markets/{marketId}/reject")
    public ResponseEntity<ApiResponse<UserResponse>>
    rejectMarket(@PathVariable Long marketId) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        adminService.rejectMarket(marketId)));
    }

    // ── 신고 관리 ─────────────────────────────

    @GetMapping("/admin/reports")
    public ResponseEntity<ApiResponse<List<ReportResponse>>>
    getAllReports(
            @RequestParam(required = false) String status) {
        List<ReportResponse> reports = status != null
                ? adminService.getReportsByStatus(status)
                : adminService.getAllReports();
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }

    @PutMapping("/admin/reports/{reportId}/status")
    public ResponseEntity<ApiResponse<ReportResponse>>
    updateReportStatus(
            @PathVariable Long reportId,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.updateReportStatus(
                        reportId, request.get("status"))));
    }

    // ── 공지 관리 ─────────────────────────────

    @GetMapping("/admin/notices")
    public ResponseEntity<ApiResponse<List<NoticeResponse>>>
    getAllNotices() {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.getAllNotices()));
    }

    @PostMapping("/admin/notices")
    public ResponseEntity<ApiResponse<NoticeResponse>>
    createNotice(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @Valid @RequestBody NoticeCreateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.createNotice(
                        userDetails.getUserId(), request)));
    }

    @PutMapping("/admin/notices/{noticeId}")
    public ResponseEntity<ApiResponse<NoticeResponse>>
    updateNotice(
            @PathVariable Long noticeId,
            @Valid @RequestBody NoticeCreateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService.updateNotice(
                        noticeId, request)));
    }

    @DeleteMapping("/admin/notices/{noticeId}")
    public ResponseEntity<ApiResponse<Void>>
    deleteNotice(@PathVariable Long noticeId) {
        adminService.deleteNotice(noticeId);
        return ResponseEntity.ok(
                ApiResponse.ok("공지가 삭제되었습니다", null));
    }

    // ── 지역화폐 관리 ─────────────────────────

    @GetMapping("/admin/local-currency")
    public ResponseEntity<ApiResponse<?>>
    getLocalCurrencyRequests() {
        return ResponseEntity.ok(
                ApiResponse.ok(adminService
                        .getLocalCurrencyRequests()));
    }

    @PutMapping("/admin/local-currency/{logId}/approve")
    public ResponseEntity<ApiResponse<Void>>
    approveLocalCurrency(
            @PathVariable Long logId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails) {
        adminService.approveLocalCurrency(
                logId, userDetails.getUserId());
        return ResponseEntity.ok(
                ApiResponse.ok("지역화폐가 승인되었습니다", null));
    }

    @PutMapping("/admin/local-currency/{logId}/reject")
    public ResponseEntity<ApiResponse<Void>>
    rejectLocalCurrency(
            @PathVariable Long logId,
            @AuthenticationPrincipal
            CustomUserDetails userDetails) {
        adminService.rejectLocalCurrency(
                logId, userDetails.getUserId());
        return ResponseEntity.ok(
                ApiResponse.ok("지역화폐가 반려되었습니다", null));
    }
}