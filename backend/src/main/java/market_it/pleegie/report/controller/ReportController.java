package market_it.pleegie.report.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.common.security.CustomUserDetails;
import market_it.pleegie.report.dto.ReportCreateRequest;
import market_it.pleegie.report.dto.ReportResponse;
import market_it.pleegie.report.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/report") // ✅ 팀 설계 원칙 준수
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * 1. 신고 접수하기
     * POST http://localhost:8080/user/reports?writerId=1
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ReportCreateRequest request) {

        // 고객센터 팀장님(Service)에게 신고 접수를 지시합니다.
        reportService.createReport(userDetails.getUserId(), request);

        return ResponseEntity.ok(ApiResponse.ok("신고가 정상적으로 접수되었습니다.", null));
    }

    /**
     * 2. 내 신고 내역 확인하기
     * GET http://localhost:8080/user/reports?writerId=1
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getMyReports(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getMyReports(userDetails.getUserId())));
    }
}
