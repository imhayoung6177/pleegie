package market_it.pleegie.common.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Component
public class QrCodeUtil {
    public String generateQrCodeBase64(String content){
        try{
            QRCodeWriter qrCodeWriter = new QRCodeWriter();

            //QR 코드 생성
            BitMatrix bitMatrix = qrCodeWriter.encode(
                    content,
                    BarcodeFormat.QR_CODE,
                    300,300
            );

            //이미지를 바이트 배열로 변환
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix,"PNG",outputStream);

            //Base64로 인코딩해서 반환
            return "data:image/png;base64,"+
                    Base64.getEncoder().encodeToString(outputStream.toByteArray());
        }catch (WriterException | IOException e){
            throw new RuntimeException("QR 코드 생성 실패", e);
        }
    }
}
