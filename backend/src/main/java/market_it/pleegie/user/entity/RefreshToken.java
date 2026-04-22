package market_it.pleegie.user.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

@Getter
@AllArgsConstructor
@RedisHash(value = "refreshToken", timeToLive = 1209600) // 14일
public class RefreshToken {

    @Id
    private String id;          // user id

    @Indexed
    private String refreshToken;
}