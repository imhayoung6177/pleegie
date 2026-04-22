package market_it.pleegie.notification.repository;

import market_it.pleegie.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // 유저 ID로 전체 알림 조회 (최신순)
    List<Notification> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    // 유저 ID + 읽음 여부로 조회
    List<Notification> findAllByUserIdAndIsRead(
            Long userId, Boolean isRead);

    // 유저 ID + 타입으로 조회
    List<Notification> findAllByUserIdAndType(
            Long userId, String type);

    // 유저의 읽지 않은 알림 개수
    int countByUserIdAndIsReadFalse(Long userId);

    // 유저의 전체 알림 읽음 처리
    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.isRead = true
            WHERE n.user.id = :userId
            AND n.isRead = false
            """)
    void markAllAsRead(@Param("userId") Long userId);

    // 유저의 특정 타입 알림 전체 삭제
    @Modifying
    @Query("""
            DELETE FROM Notification n
            WHERE n.user.id = :userId
            AND n.type = :type
            """)
    void deleteAllByUserIdAndType(
            @Param("userId") Long userId,
            @Param("type") String type);
}