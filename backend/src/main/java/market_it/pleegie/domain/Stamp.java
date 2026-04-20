package market_it.pleegie.domain; // 위치 확인!

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

/**
 * Stamp(스탬프) 엔티티는 고객이 획득한 도장 정보를 담는 장부입니다.
 * 비유: 카페에서 나눠주는 종이 쿠폰 하나하나를 의미합니다.
 */
@Entity
@Table(name = "stamp") // DB에 'stamp'라는 이름의 테이블이 생깁니다.
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Stamp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * DB의 user_id 컬럼과 연결되는 손님 고유 번호입니다.
     */
    @Column(name = "user_id", nullable = false)
    private String userTableId;

    /**
     * 누구의 도장판인가? (Member 엔티티와 연결)
     * 비유: 쿠폰 뒷면에 적힌 '손님 이름'입니다.
     */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY) // 여러 개의 도장판이 한 명의 회원에게 속함
    @JoinColumn(name = "member_id")   // DB에는 member_id라는 칸으로 저장됨
    private Member member;

    /**
     * 어느 가게의 도장인가?
     * 비유: 쿠폰 앞면에 찍힌 '가게 로고'입니다.
     */
    @Column(name = "market_name", nullable = false)
    private String marketName;

    /**
     * 현재 찍힌 도장 개수
     */
    @Builder.Default // 빌더 사용 시 기본값을 0으로 설정
    private int count = 0;

    /**
     * 상태 (예: 사용가능, 만료, 사용완료)
     */
    private String status;

    // --- 비즈니스 로직 (도장 추가 기능) ---
    /**
     * 도장을 추가하는 메서드
     * 비유: 사장님이 쿠폰에 꾹! 하고 도장을 하나 더 찍어주는 행위입니다.
     */
    public void addStamp() {
        this.count++;
    }
}