package market_it.pleegie.domain.user.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

@Data
@AllArgsConstructor
@RedisHash(value = "refreshToken", timeToLive = 1209600) // 14일 (초단위)
public class RefreshToken {

    @Id
    private String id; // 보통 유저의 이메일이나 ID 값

    @Indexed // 이 어노테이션이 있어야 token 값으로 조회 가능
    private String refreshToken;
}
