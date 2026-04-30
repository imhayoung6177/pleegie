package market_it.pleegie.admin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminLoginRequest {

    @JsonProperty("loginId")
    private String loginId;

    @JsonProperty("password")
    private String password;
}