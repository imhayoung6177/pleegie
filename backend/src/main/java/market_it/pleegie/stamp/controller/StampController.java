package market_it.pleegie.stamp.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.common.security.CustomUserDetails;
import market_it.pleegie.stamp.dto.StampResponse;
import market_it.pleegie.stamp.service.StampService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/stamp") // ✅ 팀 설계 원칙: 복수형 명사 사용
@RequiredArgsConstructor
public class StampController {

    private final StampService stampService;

    /**
     * 1. 방문 스탬프 찍기
     * POST http://localhost:8080/user/stamps?userId=1&marketId=2
     * * @param userId   도장을 받을 사용자 ID
     * @param marketId 방문한 시장 ID
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createStamp(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam Long marketId) {

        // 서비스 요리사에게 도장 찍기 명령을 내립니다.
        stampService.createStamp(userDetails.getUserId(), marketId);

        // 성공하면 팀 공통 응답 양식에 담아 보냅니다.
        return ResponseEntity.ok(ApiResponse.ok("스탬프가 성공적으로 찍혔습니다.", null));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<StampResponse>>> getStampHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                ApiResponse.ok(stampService.getStampHistory(
                        userDetails.getUserId())));
    }
}