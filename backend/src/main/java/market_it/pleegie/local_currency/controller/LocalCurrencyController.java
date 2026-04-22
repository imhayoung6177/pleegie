package market_it.pleegie.local_currency.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.common.security.CustomUserDetails;
import market_it.pleegie.local_currency.dto.LocalCurrencyResponse;
import market_it.pleegie.local_currency.service.LocalCurrencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * [비유] 손님이 직접 마주하는 식당의 '계산대'입니다.
 * 조회를 요청하거나 결제 버튼을 누르는 입구 역할을 합니다.
 */
@RestController
@RequestMapping("/user/local-currency") // 설계 원칙 준수
@RequiredArgsConstructor
public class LocalCurrencyController {

    private final LocalCurrencyService currencyService;

    /**
     * 1. 내 지역화폐 사용 로그 조회
     * GET http://localhost:8080/user/local-currency/logs?userId=1
     */
    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<LocalCurrencyResponse>>> getMyLogs(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.ok(currencyService.getMyCurrencyLogs(userDetails.getUserId())));
    }

    /**
     * 2. 지역화폐 결제 처리 (사용하기)
     * PATCH http://localhost:8080/user/local-currency/logs/{id}/use
     */
    @PatchMapping("/logs/{id}/use")
    public ResponseEntity<ApiResponse<Void>> useCurrency(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {

        // 서비스 팀장님에게 결제 완료 처리를 지시합니다.
        currencyService.useCurrency(userDetails.getUserId(), id);

        return ResponseEntity.ok(ApiResponse.ok("결제가 정상적으로 처리되었습니다.", null));
    }
}