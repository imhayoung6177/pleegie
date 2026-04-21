package market_it.pleegie.admin.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import market_it.pleegie.admin.entity.Admin;

@Getter
@NoArgsConstructor
public class AdminResponse {

    private Long id;
    private String loginId;
    private String name;

    public static AdminResponse from(Admin admin) {
        AdminResponse res = new AdminResponse();
        res.id = admin.getId();
        res.loginId = admin.getLoginId();
        res.name = admin.getName();
        return res;
    }
}