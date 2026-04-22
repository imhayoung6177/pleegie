package market_it.pleegie.market.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.market.entity.Market;
import market_it.pleegie.user.entity.User;

@Getter
@NoArgsConstructor
public class MarketCreateRequest {

    private String name;
    private String ceoName;
    private String businessNumber;  // 사업자등록번호
    private String phone;
    private Double latitude;
    private Double longitude;

    public Market toEntity(User user) {
        return Market.builder()
                .user(user)
                .name(this.name)
                .ceoName(this.ceoName)
                .businessNumber(this.businessNumber)
                .phone(this.phone)
                .latitude(this.latitude)
                .longitude(this.longitude)
                .build();
    }
}