package market_it.pleegie.report.service;

import lombok.RequiredArgsConstructor;
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

    /**
     * 새로운 신고 접수
     */
    @Transactional
    public void createReport(Long writerId, ReportCreateRequest request) {

        // 1. 중복 신고 확인 (같은 사람이 같은 대상을 또 신고하는지)
        if (reportRepository.existsByWriterIdAndTargetTypeAndTargetId(
                writerId, request.getTargetType(), request.getTargetId())) {
            throw new IllegalStateException("이미 해당 대상에 대한 신고를 접수하셨습니다.");
        }

        // 2. 작성자 정보 가져오기
        User writer = userRepository.findById(writerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 3. DTO를 엔티티로 변환하여 저장 (준호님이 만든 toEntity 활용!)
        Report report = request.toEntity(writer);
        reportRepository.save(report);
    }

    /**
     * 내 신고 내역 조회
     */
    public List<ReportResponse> getMyReports(Long writerId) {
        List<Report> reports = reportRepository.findAllByWriterIdOrderByCreatedAtDesc(writerId);

        return reports.stream()
                .map(ReportResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * [관리자] 신고 상태 변경 (예: 대기중 -> 처리중)
     */
    @Transactional
    public void updateReportStatus(Long reportId, String status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("해당 신고 내역을 찾을 수 없습니다."));

        report.updateStatus(status); // 엔티티의 비즈니스 로직 사용
    }
}