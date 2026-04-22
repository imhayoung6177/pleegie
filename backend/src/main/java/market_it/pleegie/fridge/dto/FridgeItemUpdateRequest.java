package market_it.pleegie.fridge.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class FridgeItemUpdateRequest {

    private Float quantity;     // 수량
    private String unit;        // 단위
    private LocalDate exp;      // 유통기한
    private Integer price;
    private String category;
}
