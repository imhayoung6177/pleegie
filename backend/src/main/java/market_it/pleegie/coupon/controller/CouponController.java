package market_it.pleegie.coupon.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.ApiResponse;
import market_it.pleegie.coupon.dto.UserCouponResponse;
import market_it.pleegie.coupon.service.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/coupons") // ✅ 팀 약속: 리소스 복수형 사용
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    /**
     * 내 쿠폰함 조회
     * GET http://localhost:8080/user/coupons?userId=1
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserCouponResponse>>> getMyCoupons(
            @RequestParam Long userId) {

        // 서비스 요리사에게 손님의 쿠폰 목록을 가져오라고 시킵니다.
        List<UserCouponResponse> couponList = couponService.getMyCoupons(userId);

        // 결과물을 팀 공통 응답 양식(ApiResponse)에 담아 전달합니다.
        return ResponseEntity.ok(ApiResponse.ok("쿠폰 목록 조회 성공", couponList));
    }
}