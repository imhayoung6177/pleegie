package market_it.pleegie.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.common.security.CustomUserDetails;
import market_it.pleegie.user.dto.*;
import market_it.pleegie.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ── 회원가입 ──────────────────────────────

    @PostMapping("/user/signup")
    public ResponseEntity<ApiResponse<UserResponse>> signup(
            @Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(userService.signup(request)));
    }

    // ── 로그인 ────────────────────────────────

    @PostMapping("/user/login")
    public ResponseEntity<ApiResponse<UserLoginResponse>> login(
            @Valid @RequestBody UserLoginRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(userService.login(request)));
    }

    // ── 토큰 재발급 ───────────────────────────

    @PostMapping("/user/reissue")
    public ResponseEntity<ApiResponse<UserLoginResponse>> reissue(
            @RequestHeader("Refresh-Token") String refreshToken) {
        return ResponseEntity.ok(
                ApiResponse.ok(userService.reissue(refreshToken)));
    }

    // ── 로그아웃 ──────────────────────────────

    @PostMapping("/user/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.logout(userDetails.getUserId());
        return ResponseEntity.ok(
                ApiResponse.ok("로그아웃 되었습니다", null));
    }

    // ── 내 정보 조회 ──────────────────────────

    @GetMapping("/user/mypage")
    public ResponseEntity<ApiResponse<UserResponse>> getMyInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                ApiResponse.ok(userService.getMyInfo(
                        userDetails.getUserId())));
    }

    // ── 내 정보 수정 ──────────────────────────

    @PutMapping("/user/mypage")
    public ResponseEntity<ApiResponse<UserResponse>> updateMyInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(userService.updateMyInfo(
                        userDetails.getUserId(), request)));
    }

    // ── 비밀번호 변경 ─────────────────────────

    @PutMapping("/user/password")
    public ResponseEntity<ApiResponse<Void>> updatePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UserPasswordUpdateRequest request) {
        userService.updatePassword(
                userDetails.getUserId(), request);
        return ResponseEntity.ok(
                ApiResponse.ok("비밀번호가 변경되었습니다", null));
    }

    // ── 회원 탈퇴 ─────────────────────────────

    @DeleteMapping("/user/mypage")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.deleteAccount(userDetails.getUserId());
        return ResponseEntity.ok(
                ApiResponse.ok("회원 탈퇴가 완료되었습니다", null));
    }
}