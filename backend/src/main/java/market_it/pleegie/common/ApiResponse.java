package market_it.pleegie.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 프로젝트 공통 응답 양식
 * 모든 API는 이 봉투에 담겨서 나갑니다.
 */
@Getter
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success; // 성공 여부 (true/false)
    private String message;  // 결과 메시지
    private T data;          // 실제 데이터 (장바구니 목록 등)

    // 성공했을 때 간편하게 사용하는 'ok' 메서드
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    // 실패했을 때 사용하는 메서드 (필요시 사용)
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
