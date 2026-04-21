package market_it.pleegie.report.repository;

import market_it.pleegie.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    // 신고자 ID로 조회 (내가 신고한 목록)
    List<Report> findAllByWriterIdOrderByCreatedAtDesc(Long writerId);

    // 상태별 전체 조회 (관리자 - PENDING / IN_PROGRESS / RESOLVED)
    List<Report> findAllByStatusOrderByCreatedAtAsc(String status);

    // 신고 대상 타입 + 대상 ID로 조회
    // (특정 유저 또는 시장에 대한 신고 목록)
    List<Report> findAllByTargetTypeAndTargetId(
            String targetType, Long targetId);

    // 관리자 - 전체 신고 최신순 조회
    List<Report> findAllByOrderByCreatedAtDesc();

    // 신고 대상별 신고 횟수 조회 (관리자 - 통계)
    @Query("""
            SELECT r.targetType,
                   r.targetId,
                   COUNT(r) AS reportCount
            FROM Report r
            GROUP BY r.targetType, r.targetId
            ORDER BY reportCount DESC
            """)
    List<Object[]> findReportCountByTarget();

    // 처리되지 않은 신고 개수 (관리자 대시보드)
    int countByStatus(String status);

    // 중복 신고 확인
    // (같은 신고자가 같은 대상을 이미 신고했는지)
    boolean existsByWriterIdAndTargetTypeAndTargetId(
            Long writerId, String targetType, Long targetId);
}