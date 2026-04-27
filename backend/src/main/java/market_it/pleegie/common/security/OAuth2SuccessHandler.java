package market_it.pleegie.common.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class OAuth2SuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        // JWT 발급
        String accessToken = jwtProvider.generateAccessToken(
                userDetails.getUserId(),
                userDetails.getUser().getRole());

        // 프론트로 리다이렉트 (토큰을 쿼리 파라미터로 전달)
        String redirectUrl = "http://localhost:5173/oauth2/callback"
                + "?token=" + accessToken
                + "&role=" + userDetails.getUser().getRole();

        log.info("OAuth2 로그인 성공 - userId: {}",
                userDetails.getUserId());

        getRedirectStrategy().sendRedirect(
                request, response, redirectUrl);
    }
}