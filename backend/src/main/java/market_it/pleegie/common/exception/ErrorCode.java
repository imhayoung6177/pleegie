package market_it.pleegie.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "유저를 찾을 수 없습니다"),
    DUPLICATE_LOGIN_ID(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다"),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없습니다"),

    // Report
    DUPLICATE_REPORT(HttpStatus.CONFLICT, "이미 신고한 대상입니다"),

    // Market
    MARKET_NOT_FOUND(HttpStatus.NOT_FOUND, "시장을 찾을 수 없습니다"),
    MARKET_NOT_APPROVED(HttpStatus.FORBIDDEN, "승인되지 않은 시장입니다"),
    INVALID_DISCOUNT(HttpStatus.BAD_REQUEST, "할인율 또는 할인 가격 중 하나는 입력해야 합니다."),

    // Fridge
    FRIDGE_NOT_FOUND(HttpStatus.NOT_FOUND, "냉장고를 찾을 수 없습니다"),
    FRIDGE_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "냉장고 재료를 찾을 수 없습니다"),

    // Recipe
    RECIPE_NOT_FOUND(HttpStatus.NOT_FOUND, "레시피를 찾을 수 없습니다"),

    // Cart
    CART_NOT_FOUND(HttpStatus.NOT_FOUND, "장바구니 항목을 찾을 수 없습니다"),

    // Stamp / Coupon
    COUPON_NOT_FOUND(HttpStatus.NOT_FOUND, "쿠폰을 찾을 수 없습니다"),
    STAMP_NOT_ENOUGH(HttpStatus.BAD_REQUEST, "스탬프가 부족합니다"),
    ALREADY_STAMPED(HttpStatus.CONFLICT, "오늘 이미 스탬프를 찍었습니다"),
    COUPON_NOT_COMPLETED(HttpStatus.BAD_REQUEST, "쿠폰이 완성되지 않았습니다"),

    // Token
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다"),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다"),

    // Common
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "잘못된 입력입니다"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다");

    private final HttpStatus status;
    private final String message;
}