package market_it.pleegie.user.repository;

import market_it.pleegie.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 로그인 ID로 조회 (일반 로그인)
    Optional<User> findByLoginId(String loginId);

    // OAuth 로그인 조회
    Optional<User> findByOauthProviderAndOauthId(
            String oauthProvider, String oauthId);

    // 이메일로 조회 (중복 체크)
    boolean existsByEmail(String email);

    // 로그인 ID 중복 체크
    boolean existsByLoginId(String loginId);

    // role별 전체 조회 (관리자 - 회원 목록 / 사업자 목록)
    List<User> findAllByRole(String role);

    // role + status로 조회 (관리자 - 상태별 필터링)
    List<User> findAllByRoleAndStatus(String role, String status);

    // ROLE이 USER이고, 상태가 DELETED가 아닌 사람만 골라내는 도구 [준호 추가]
    List<User> findAllByRoleAndStatusNot(String role, String status);

    // 최근 7일 가입자 계산용 [준호 추가]
    long countByCreatedAtAfter(LocalDateTime date);

    // 관리자 - 이름으로 검색
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.name LIKE %:name%")
    List<User> findAllByRoleAndNameContaining(
            @Param("role") String role,
            @Param("name") String name);
}