package market_it.pleegie.item.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ItemMasterCreateRequest {
    private String name;      // 필수
    private String category;  // 없으면 "기타"
    private String unit;      // 없으면 "개"
}
