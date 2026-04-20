package market_it.pleegie.repository.user;

import market_it.pleegie.domain.user.entity.RefreshToken;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {
    // 토큰 값으로 RefreshToken 객체 찾기위한 메서드
    Optional<RefreshToken> findByRefreshToken (String refreshToken);
}
