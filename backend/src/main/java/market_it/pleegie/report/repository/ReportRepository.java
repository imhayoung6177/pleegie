package market_it.pleegie.report.repository;

import market_it.pleegie.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    // 신고자 ID로 조회 (내가 접수한 목록)
    List<Report> findAllByWriterIdOrderByCreatedAtDesc(Long writerId);

    // 상태별 전체 조회 (관리자)
    List<Report> findAllByStatusOrderByCreatedAtAsc(String status);

    // 관리자 - 전체 불편사항 최신순 조회
    List<Report> findAllByOrderByCreatedAtDesc();

    // 처리되지 않은 건수 (관리자 대시보드)
    int countByStatus(String status);
}