package market_it.pleegie.report.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.exception.CustomException;
import market_it.pleegie.common.exception.ErrorCode;
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

        // 2. 작성자 정보 가져오기
        User writer = userRepository.findById(writerId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 3. DTO를 엔티티로 변환하여 저장 (준호님이 만든 toEntity 활용!)
        Report report = request.toEntity(writer);
        reportRepository.save(report);
    }

    /**
     * 내 신고 내역 조회
     */
    public List<ReportResponse> getMyReports(Long writerId) {

        return reportRepository.findAllByWriterIdOrderByCreatedAtDesc(writerId)
                .stream()
                .map(ReportResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * [관리자] 신고 상태 변경 (예: 대기중 -> 처리중)
     * updateReportStatus → AdminService로 이동 (중복)
     */

}