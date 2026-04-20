package market_it.pleegie.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity // 1. 이 클래스가 DB의 테이블과 연결될 '설계도'임을 선언합니다.
@Table(name = "item") // DB에는 'item'이라는 이름의 테이블로 생성됩니다.
@Getter @Setter // 2. 데이터를 넣고 빼기 위한 Getter/Setter를 자동으로 만듭니다.
public class Item {

    @Id // 3. 각 상품을 구별할 '주민번호' 같은 기본키(Primary Key)입니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // DB가 번호를 1, 2, 3... 자동으로 붙여줍니다.
    @Column(name = "item_id")
    private Long id;

    @Column(nullable = false, length = 50) // 4. 상품 이름은 필수(null 불가)이고 50자까지 가능합니다.
    private String itemName;

    @Column(nullable = false) // 5. 가격 설정
    private int price;

    @Column(nullable = false) // 6. 재고 수량
    private int stockNumber;

    @Lob // 7. 글자 수가 아주 많은 '상세 설명'을 담을 때 사용합니다.
    @Column(nullable = false)
    private String itemDetail;

    // 8. 상품 상태 (판매 중인지, 품절인지 등을 글자로 관리)
    private String itemSellStatus;

    // 기획서에 있는 '할인' 관련 정보를 추가합니다.
    private int discountRate;        // 할인율 (예: 20 -> 20% 할인)

    private java.time.LocalDateTime startTime; // 할인 시작 시간
    private java.time.LocalDateTime endTime;   // 할인 종료 시간
}