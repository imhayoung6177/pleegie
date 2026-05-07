package market_it.pleegie.report.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.exception.CustomException;
import market_it.pleegie.common.exception.ErrorCode;
import market_it.pleegie.notification.entity.Notification;
import market_it.pleegie.notification.repository.NotificationRepository;
import market_it.pleegie.report.dto.ReportCreateRequest;
import market_it.pleegie.report.dto.ReportResponse;
import market_it.pleegie.report.entity.Report;
import market_it.pleegie.report.repository.ReportRepository;
import market_it.pleegie.user.entity.User;
import market_it.pleegie.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    /**
     * 새로운 신고 접수 (Create)
     */
    @Transactional
    public void createReport(Long writerId, ReportCreateRequest request) {
        User writer = userRepository.findById(writerId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Report report = request.toEntity(writer);
        reportRepository.save(report);
    }

    /**
     * [관리자] 신고 처리 결과 반영 및 신고자 알림 발송 (직접 메시지 방식)
     * @param reportId 처리할 신고 ID
     * @param action 처리 액션 (처리중, 완료, 반려 등)
     * @param message 관리자가 직접 입력한 알림 내용 🚀
     */
    @Transactional
    public void processReportResult(Long reportId, String action, String message) {
        // 1. 신고 내역 조회
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new CustomException(ErrorCode.REPORT_NOT_FOUND));

        // 2. 신고 상태 업데이트 (화면에서 넘어온 "처리중", "완료", "반려" 등을 그대로 저장)
        // 더티 체킹(Dirty Checking)에 의해 메서드 종료 시 DB에 자동 반영됩니다.
        report.updateStatus(action);

        // 3. [핵심] 관리자가 입력한 메시지로 알림 데이터 생성
        Notification notification = Notification.builder()
                .user(report.getWriter()) // 알림 수신자: 신고를 작성한 유저
                .message(message)         // 🚀 관리자가 직접 작성한 메시지 그대로 저장
                .isRead(false)            // 읽음 여부: 초기값 false (안 읽음)
                .build();

        // 4. 알림 DB 저장
        notificationRepository.save(notification);
    }

    /**
     * 내 신고 내역 조회 (Read)
     */
    public List<ReportResponse> getMyReports(Long writerId) {
        return reportRepository.findAllByWriterIdOrderByCreatedAtDesc(writerId)
                .stream()
                .map(ReportResponse::from)
                .collect(Collectors.toList());
    }

    // 신고 삭제 기능을 위한 메서드 추가 << 5.6 종빈 추가 >>
    @Transactional
    public void deleteReport(Long userId, Long reportId) {
        // 1. 해당 신고글 조회
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new CustomException(ErrorCode.REPORT_NOT_FOUND));

        // 2. 본인 작성 여부 검증
        if (!report.getWriter().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        // 3.  이미 처리 중(IN_PROGRESS)이거나 완료(RESOLVED)된 건 삭제 불가하게 설정 가능
        if (!"PENDING".equals(report.getStatus())) {
            throw new CustomException(ErrorCode.INVALID_INPUT); // "이미 처리 중인 내역은 취소할 수 없습니다."
        }

        reportRepository.delete(report);
    }
}