package market_it.pleegie.utils;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Component;

import java.awt.image.BufferedImage;
import java.util.HashMap;
import java.util.Map;

@Component // 스프링이 이 클래스를 '공용 도구'로 관리하도록 등록합니다.
public class QRCodeUtil {

    /**
     * 내용을 넣으면 QR코드 이미지(도화지)로 바꿔주는 메서드
     * @param text QR안에 담고 싶은 글자 (URL이나 UUID 등)
     * @param width QR 코드의 너비
     * @param height QR 코드의 높이
     */
    public BufferedImage generateQRCodeImage(String text, int width, int height) throws WriterException {
        // 1. QR코드 그리는 도구 준비
        QRCodeWriter qrCodeWriter = new QRCodeWriter();

        // 2. 한글 깨짐 방지 설정 (UTF-8)
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

        // 3. 진짜 QR코드 데이터 생성
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);

        // 4. 데이터를 이미지(BufferedImage) 형태로 변환해서 돌려줍니다.
        return MatrixToImageWriter.toBufferedImage(bitMatrix);
    }
}