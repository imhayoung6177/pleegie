package market_it.pleegie.domain.user;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import market_it.pleegie.domain.BaseEntity;

@Entity
@Data
@NoArgsConstructor
        //(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // 작성자 표시용(임시)

    // DB 테이블 구조(NOT NULL)에 맞추기 위해 필드 추가
    @Column(name = "login_id", nullable = false, unique = true)
    private String loginId;
    @Column(nullable = false)
    private String password;
}
