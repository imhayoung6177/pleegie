package market_it.pleegie.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserUpdateRequest {

    private String name;
    private String phone;
    private String email;
    private Double latitude;
    private Double longitude;
}