package market_it.pleegie.item.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.item.entity.ItemMaster;

@Getter
@NoArgsConstructor
public class ItemMasterResponse {

    private Long id;
    private String name;
    private String unit;
    private String category;

    public static ItemMasterResponse from(ItemMaster itemMaster) {
        ItemMasterResponse res = new ItemMasterResponse();
        res.id = itemMaster.getId();
        res.name = itemMaster.getName();
        res.unit = itemMaster.getUnit();
        res.category = itemMaster.getCategory();
        return res;
    }
}
