package market_it.pleegie.common.security.oauth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import market_it.pleegie.common.security.CustomUserDetails;
import market_it.pleegie.user.entity.User;
import market_it.pleegie.user.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration()
                .getRegistrationId().toUpperCase();

        OAuth2UserInfo userInfo = switch (registrationId) {
            case "KAKAO" -> new KakaoOAuth2UserInfo(
                    oAuth2User.getAttributes());
            case "NAVER" -> new NaverOAuth2UserInfo(
                    oAuth2User.getAttributes());
            case "GOOGLE" -> new GoogleOAuth2UserInfo(
                    oAuth2User.getAttributes());
            default -> throw new OAuth2AuthenticationException(
                    "지원하지 않는 OAuth 제공자: " + registrationId);
        };

        User user = saveOrUpdate(userInfo);

        // attributes 함께 전달 ← 수정된 부분
        return new CustomUserDetails(user, oAuth2User.getAttributes());
    }

    private User saveOrUpdate(OAuth2UserInfo userInfo) {
        Optional<User> existingUser = userRepository
                .findByOauthProviderAndOauthId(
                        userInfo.getProvider(),
                        userInfo.getId());

        if (existingUser.isPresent()) {
            // 기존 유저 → 이름 업데이트
            return existingUser.get();
        }

        // 신규 유저 → 회원가입
        User newUser = User.builder()
                .name(userInfo.getName())
                .email(userInfo.getEmail())
                .oauthProvider(userInfo.getProvider())
                .oauthId(userInfo.getId())
                .role("USER")
                .build();

        return userRepository.save(newUser);
    }
}