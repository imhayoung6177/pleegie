package market_it.pleegie.domain;

import lombok.*;
import java.time.LocalDate;

public class FridgeItemDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private Long fridgeId;       // 어떤 냉장고에 넣을지 (필수)
        private Long itemMasterId;   // 어떤 재료인지 (필수)
        private Long marketId;       // 어디서 샀는지 (선택)
        private String category;     // 카테고리
        private LocalDate exp;       // 유통기한
        private Integer price;       // 가격
        private String imageUrl;     // 이미지 경로

        // DTO -> Entity 변환
        public FridgeItem toEntity() {
            return FridgeItem.builder()
                    .fridgeId(this.fridgeId)
                    .itemMasterId(this.itemMasterId)
                    .marketId(this.marketId)
                    .category(this.category)
                    .exp(this.exp)
                    .price(this.price)
                    .imageUrl(this.imageUrl)
                    .build();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private LocalDate exp;
        private Integer price;
        private String category;
        // 필요에 따라 수정 가능한 필드 추가
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long fridgeId;
        private Long itemMasterId;
        private Long marketId;
        private String category;
        private LocalDate exp;
        private Integer price;
        private String imageUrl;

        // Entity -> DTO 변환
        public static Response from(FridgeItem item) {
            return Response.builder()
                    .id(item.getId())
                    .fridgeId(item.getFridgeId())
                    .itemMasterId(item.getItemMasterId())
                    .marketId(item.getMarketId())
                    .category(item.getCategory())
                    .exp(item.getExp())
                    .price(item.getPrice())
                    .imageUrl(item.getImageUrl())
                    .build();
        }
    }
}
