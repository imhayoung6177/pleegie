package market_it.pleegie.money.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.common.security.CustomUserDetails;
import market_it.pleegie.money.dto.MoneyLogCreateRequest;
import market_it.pleegie.money.dto.MoneyLogResponse;
import market_it.pleegie.money.service.MoneyLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/money-log") // 설계 원칙에 따라 복수형
@RequiredArgsConstructor
public class MoneyLogController {

    private final MoneyLogService moneyLogService;

    /**
     * 특정 사용자의 가계부 목록 조회
     * GET http://localhost:8080/user/money-logs/{userId}
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MoneyLogResponse>>> getMoneyLogs(@AuthenticationPrincipal CustomUserDetails userDetails) {
        // 서비스에서 데이터를 가져와서 응답합니다.
        return ResponseEntity.ok(ApiResponse.ok(moneyLogService.getLogs(userDetails.getUserId())));
    }

    // 수기 입력 (시장 외 구매)
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createManualLog(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody MoneyLogCreateRequest request) {
        moneyLogService.createManualLog(
                userDetails.getUserId(), request);
        return ResponseEntity.ok(
                ApiResponse.ok("가계부에 기록되었습니다", null));
    }

    @DeleteMapping("/{logId}")
    public ResponseEntity<ApiResponse<Void>> deleteLog(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long logId) {
        moneyLogService.deleteLog(userDetails.getUserId(), logId);
        return ResponseEntity.ok(
                ApiResponse.ok("삭제되었습니다", null));
    }
}