package market_it.pleegie.domain;

import lombok.*;
import market_it.pleegie.domain.fridge.Entity.Fridge;
import market_it.pleegie.domain.fridge.Entity.FridgeItem;
import market_it.pleegie.domain.item.entity.ItemMaster;
import market_it.pleegie.domain.market.entity.Market;
import java.time.LocalDate;

public class FridgeItemDTO {

    /* ════════════════════════════════════════
       재료 등록 요청 DTO (POST)
       - 프론트에서 보낸 데이터 Spring이 받음
    ════════════════════════════════════════ */
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private Long itemMasterId;   // 어떤 재료인지 (필수)
        private String category;     // 카테고리
        private LocalDate exp;       // 유통기한
        private Integer price;       // 가격
        private String imageUrl;     // 이미지 경로

        // 서비스 레이어에서 DB 객체들을 찾아오면, 이를 묶어서 실제 엔티티로 변환합니다.
        public FridgeItem toEntity(Fridge fridge, ItemMaster itemMaster) {
            // 현재 서비스 방침에 따라 세 번째 인자인 Market은 null로 고정합니다.
            return FridgeItem.create(
                    fridge,
                    itemMaster,
                    null,            // ◀ Market: 기능 미사용으로 null 처리
                    this.category,
                    this.exp,
                    this.price,
                    this.imageUrl
            );
        }
    }

    /* ════════════════════════════════════════
       재료 수정 요청 DTO (PUT)
       - 수정할 필드만 담아서 보낼 때 사용합니다.
    ════════════════════════════════════════ */
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private LocalDate exp;
        private Integer price;
        private String category;
    }

    /*API 활용하여 유사도 검색을 통해 DB 저장 기능 */
    // [바구니 1] 리액트에서 "대패삼겹" 같은 글자를 보낼 때 사용
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ExtractionRequest {
        private String userInput;
    }

    // [바구니 2] 외부 API(공공데이터)에서 받은 원본 데이터를 잠시 담을 때 사용
    // DB 테이블과 상관없이 API 통신을 위한 임시 규격입니다.
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ApiStandardResponse {
        private String itemName;   // API가 준 품목명
        private String kindName;   // API가 준 품종명
        private String category;   // API가 준 부류명
    }

    /* ════════════════════════════════════════
       응답 전용 DTO (GET, POST 응답용)
       - 엔티티 객체의 복잡한 구조를 리액트가 쓰기 편하게 평탄화합니다.
    ════════════════════════════════════════ */
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long fridgeId;
        private Long itemMasterId;
        private String name;         // ItemMaster에서 꺼내온 재료 이름
        private String category;
        private LocalDate exp;
        private Integer price;
        private String imageUrl;

        // [정적 팩토리 메서드] 빌더 대신 사용하여 객체를 생성합니다.
        public static Response from(FridgeItem item) {
            Response res = new Response();
            res.setId(item.getId());

            // 연관된 Fridge 객체에서 ID만 추출
            res.setFridgeId(item.getFridge().getId());

            // 연관된 ItemMaster 객체에서 ID와 이름 추출
            res.setItemMasterId(item.getItemMaster().getId());
            res.setName(item.getItemMaster().getName());

            res.setCategory(item.getCategory());
            res.setExp(item.getExp());
            res.setPrice(item.getPrice());
            res.setImageUrl(item.getImageUrl());

            return res;
        }
    }
}