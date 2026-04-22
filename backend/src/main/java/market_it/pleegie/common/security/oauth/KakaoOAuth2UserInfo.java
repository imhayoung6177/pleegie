package market_it.pleegie.common.security.oauth;

import java.util.Map;

public class KakaoOAuth2UserInfo extends OAuth2UserInfo {

    public KakaoOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getId() {
        return String.valueOf(attributes.get("id"));
    }

    @Override
    @SuppressWarnings("unchecked")
    public String getName() {
        Map<String, Object> properties =
                (Map<String, Object>) attributes.get("properties");
        if (properties == null) return "카카오유저";
        return (String) properties.get("nickname");
    }

    @Override
    public String getEmail() {
        // 비즈니스 인증 없으면 null
        return null;
    }

    @Override
    public String getProvider() {
        return "KAKAO";
    }
}