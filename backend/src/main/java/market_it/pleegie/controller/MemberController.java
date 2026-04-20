package market_it.pleegie.controller;

import market_it.pleegie.dto.PasswordResetRequestDto;
import market_it.pleegie.domain.Member;
import market_it.pleegie.service.MemberService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController // 이 클래스는 JSON 데이터를 주고받는 '통신 창구'임을 선언합니다.
@RequestMapping("/api/member") // 모든 주소 앞에 /api/member가 자동으로 붙습니다.
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    /**
     * 회원가입 창구
     */
    @PostMapping("/join")
    public Long join(@RequestBody Member member) {
        return memberService.join(member);
    }

    /**
     * 로그인 창구 (ara 수정)
     */
//    @PostMapping("/login")
//    public String login(@RequestBody Map<String, String> loginData) {
//        try {
//            Member member = memberService.login(loginData.get("userId"), loginData.get("password"));
//            String roleStr = "MERCHANT".equals(member.getRole()) ? "[상인] " : "[일반] ";
//            return roleStr + member.getName() + "님, 환영합니다!";
//        } catch (IllegalArgumentException e) {
//            return e.getMessage();
//        }
//    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        try {
            // Service에서 생성된 토큰 맵을 받아와서 반환
            Map<String, String> response = memberService.login(loginData.get("userId"), loginData.get("password"));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /**
     * 회원 탈퇴 창구
     */
    @DeleteMapping("/withdraw/{userId}")
    public String withdraw(@PathVariable String userId) {
        try {
            memberService.withdraw(userId);
            return "탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.";
        } catch (Exception e) {
            return "탈퇴 처리 중 오류가 발생했습니다.";
        }
    }

    /**
     * 아이디 찾기 창구 (일반)
     */
    @GetMapping("/find-id")
    public String findUserId(@RequestParam String name, @RequestParam String email) {
        try {
            String userId = memberService.findUserId(name, email);
            return "찾으시는 아이디는 [" + userId + "] 입니다.";
        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    /**
     * 🚀 [수정 완료] 비밀번호 재설정 창구 (일반/상인 통합)
     * POST http://localhost:8080/api/member/reset-password
     */
    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody PasswordResetRequestDto request) {
        try {
            // 💡 낱개로 보내지 않고, 바구니(request)를 통째로 Service에 넘깁니다.
            memberService.resetPassword(request);

            return "비밀번호가 성공적으로 변경되었습니다. 새로운 비밀번호로 로그인해주세요!";
        } catch (IllegalArgumentException e) {
            // 정보가 하나라도 안 맞으면 Service에서 던진 에러 메시지를 화면에 보여줍니다.
            return e.getMessage();
        }
    }

    /**
     * 상인 전용 아이디 찾기 창구
     */
    @PostMapping("/find-merchant-id")
    public String findMerchantId(@RequestBody PasswordResetRequestDto request) {
        try {
            String userId = memberService.findMerchantId(request.getName(), request.getBusinessNumber());
            return "찾으시는 사장님 아이디는 [" + userId + "] 입니다.";
        } catch (IllegalArgumentException e) {
            return e.getMessage();
        }
    }

    /**
     * 상인 전용 회원가입 창구
     * POST http://localhost:8080/api/member/merchant-join
     */
    @PostMapping("/merchant-join")
    public Long merchantJoin(@RequestBody Member member) {
        // 💡 서비스의 merchantJoin을 호출하면서
        // 사업자 번호와 상호명을 같이 전달합니다.
        return memberService.merchantJoin(member, member.getBusinessNumber(), member.getMarketName());
    }

    /**
     * 로그아웃 (간이 구현)
     */
    @PostMapping("/logout")
    public String logout() {
        return "로그아웃 되었습니다.";
    }

    /**
     * 내 도장 목록 조회 창구 추가
     * GET http://localhost:8080/api/member/my-stamps?userId=사용자아이디
     */
    @GetMapping("/my-stamps")
    public java.util.List<market_it.pleegie.domain.Stamp> getMyStamps(@RequestParam String userId) {
        // 💡 memberService에게 "이 아이디를 가진 회원의 도장 목록을 가져와!"라고 시킵니다.
        return memberService.getMyStamps(userId);
    }
}