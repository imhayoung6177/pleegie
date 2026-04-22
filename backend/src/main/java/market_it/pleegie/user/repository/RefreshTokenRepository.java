package market_it.pleegie.user.repository;

import market_it.pleegie.user.entity.RefreshToken;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

// Redis 사용이므로 CrudRepository 사용
public interface RefreshTokenRepository
        extends CrudRepository<RefreshToken, String> {

    // refreshToken 값으로 조회 (토큰 재발급 시)
    Optional<RefreshToken> findByRefreshToken(String refreshToken);

    // 로그아웃 시 삭제
    void deleteById(String id);
}