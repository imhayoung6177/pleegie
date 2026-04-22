package market_it.pleegie.notice.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.notice.dto.NoticeResponse;
import market_it.pleegie.notice.entity.Notice;
import market_it.pleegie.notice.repository.NoticeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;

    /**
     * 일반 사용자용 공지사항 목록 조회
     * (비유: 손님이 게시판에서 '전체'와 '손님용' 글만 모아서 보는 과정)
     */
    public List<NoticeResponse> getNoticesForUser() {
        // 1. "ALL"과 "USER" 타입의 공지만 창고에서 가져옵니다.
        List<String> targets = Arrays.asList("ALL", "USER");
        List<Notice> notices = noticeRepository.findAllByTargetTypeInOrderByCreatedAtDesc(targets);

        // 2. 가져온 원재료들을 손님에게 보여줄 예쁜 접시(DTO)에 담습니다.
        return notices.stream()
                .map(NoticeResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 공지사항 상세 조회
     */
    public NoticeResponse getNoticeDetail(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 공지사항이 존재하지 않습니다."));
        return NoticeResponse.from(notice);
    }
}