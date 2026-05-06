package market_it.pleegie.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 대시보드 통계 데이터를 담는 상자 (DTO)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatisticsResponse {

    private long newUsersCount;     // 주간 가입자 수
    private String topItemName;     // 인기 품목 이름
    private long topItemCount;      // 인기 품목 조회수
    private long totalSavedRecipes; // 저장된 레시피 수
    private double couponUsageRate; // 쿠폰 사용률
}