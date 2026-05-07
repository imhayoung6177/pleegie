package market_it.pleegie.market.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.market.entity.Market;

@Getter
@NoArgsConstructor
public class MarketResponse {

    private Long id;
    private String name;
    private String ceoName;
    private String businessNumber;
    private String phone;
    private Double latitude;
    private Double longitude;
    private String qrCodeUrl;
    private String qrToken;
    private String status;          // PENDING / APPROVED / SUSPENDED

    public static MarketResponse from(Market market) {
        MarketResponse res = new MarketResponse();
        res.id = market.getId();
        res.name = market.getName();
        res.ceoName = market.getCeoName();
        res.businessNumber = market.getBusinessNumber();
        res.phone = market.getPhone();
        res.latitude = market.getLatitude();
        res.longitude = market.getLongitude();
        res.qrCodeUrl = market.getQrCodeUrl();
        res.qrToken = market.getQrToken();
        res.status = market.getStatus();
        return res;
    }
}