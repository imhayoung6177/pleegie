package market_it.pleegie.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter @Setter
public class BusinessVerifyResponseDto {
    private String status_code; // 결과 코드 (OK 등)
    private List<BusinessData> data; // 실제 사업자 상태 데이터들

    @Getter @Setter
    public static class BusinessData {
        private String b_no;       // 우리가 보낸 사업자 번호
        private String b_stt;      // 사업자 상태 (계속사업자, 휴업 등)
        private String tax_type;   // 과세 유형 (일반과세자 등)
    }
}