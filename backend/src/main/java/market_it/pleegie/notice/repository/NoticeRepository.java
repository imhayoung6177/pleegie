package market_it.pleegie.notice.repository;

import market_it.pleegie.notice.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    // 전체 공지 최신순 조회
    List<Notice> findAllByOrderByCreatedAtDesc();

    // 대상별 공지 조회 (USER / MARKET / ALL)
    List<Notice> findAllByTargetTypeOrderByCreatedAtDesc(
            String targetType);

    // 일반회원용 공지 조회
    // USER 공지 + ALL 공지
    List<Notice> findAllByTargetTypeInOrderByCreatedAtDesc(
            List<String> targetTypes);

    // 제목으로 공지 검색 (관리자)
    List<Notice> findAllByTitleContainingOrderByCreatedAtDesc(
            String title);

    // 관리자 ID로 작성한 공지 조회
    List<Notice> findAllByAdminIdOrderByCreatedAtDesc(Long adminId);
}