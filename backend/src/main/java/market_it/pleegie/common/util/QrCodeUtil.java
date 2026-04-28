package market_it.pleegie.common.util;

import org.springframework.stereotype.Component;

@Component
public class QrCodeUtil {

    public String generateQrCodeUrl(String qrToken) {
        return "http://localhost:8080/market/qr/" + qrToken;
    }
}