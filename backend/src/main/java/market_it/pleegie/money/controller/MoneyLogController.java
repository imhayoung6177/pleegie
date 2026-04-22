package market_it.pleegie.money.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.ApiResponse;
import market_it.pleegie.money.service.MoneyLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user/money-logs") // 설계 원칙에 따라 복수형
@RequiredArgsConstructor
public class MoneyLogController {

    private final MoneyLogService moneyLogService;

    /**
     * 특정 사용자의 가계부 목록 조회
     * GET http://localhost:8080/user/money-logs/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<?>> getMoneyLogs(@PathVariable Long userId) {
        // 서비스에서 데이터를 가져와서 응답합니다.
        return ResponseEntity.ok(ApiResponse.ok("가계부 조회 성공", moneyLogService.getLogs(userId)));
    }
}