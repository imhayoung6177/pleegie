package market_it.pleegie.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Entity(엔티티)는 데이터베이스의 테이블과 1:1로 매핑되는 클래스입니다.
 */
@Entity
@Table(name = "user")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. login_id 컬럼과 연결
    @Column(name = "login_id", nullable = false, unique = true)
    private String loginId;

    // 2. user_id 컬럼과 연결
    @Column(name = "user_id")
    private String userId;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private String phone;
    private Double latitude;
    private Double longitude;
    private String status;

//    @Column(name = "user_id")
//    private String userTableId;

    // 상인(사장님) 전용 정보
    @Column(name = "business_number", unique = true)
    private String businessNumber;

    @Column(name = "market_name")
    private String marketName;

    private String role; // USER: 일반인, MERCHANT: 상인

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Stamp> stamps = new ArrayList<>();

    // QR 코드 및 UUID 정보
    @Column(unique = true)
    private String uuid; // 가게 고유 번호

    private String qrCodePath; // 생성된 QR 이미지 파일 저장 경로

    /**
     * 정보를 업데이트해주는 메서드
     */
    public void updateQrInfo(String uuid, String qrCodePath) {
        this.uuid = uuid;
        this.qrCodePath = qrCodePath;
    }

    /**
     * 비밀번호 변경 메서드
     */
    public void setPassword(String password) {
        this.password = password;
    }
}
