package market_it.pleegie.admin.repository;

import market_it.pleegie.admin.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    // 로그인 ID로 조회
    Optional<Admin> findByLoginId(String loginId);

    // 로그인 ID 중복 체크
    boolean existsByLoginId(String loginId);
}
