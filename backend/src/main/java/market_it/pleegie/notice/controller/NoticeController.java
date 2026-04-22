package market_it.pleegie.notice.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.notice.dto.NoticeResponse;
import market_it.pleegie.notice.service.NoticeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/notices") // ✅ 리소스 복수형 사용 원칙
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    /**
     * 1. 사용자용 공지사항 목록 조회
     * GET http://localhost:8080/user/notices
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NoticeResponse>>> getNotices() {
        return ResponseEntity.ok(ApiResponse.ok(noticeService.getNoticesForUser()));
    }

    /**
     * 2. 공지사항 상세 조회
     * GET http://localhost:8080/user/notices/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticeResponse>> getNoticeDetail(@PathVariable Long id) {

        return ResponseEntity.ok(ApiResponse.ok(noticeService.getNoticeDetail(id)));
    }
}