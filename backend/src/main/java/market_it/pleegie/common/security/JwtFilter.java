package market_it.pleegie.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = resolveToken(request);
        System.out.println("요청 URL: "+ request.getRequestURI());
        System.out.println("추출된 토큰: "+ token);

        if (StringUtils.hasText(token)
                && jwtProvider.validateToken(token)) {
            System.out.println("토큰 유효함");

            Long userId = jwtProvider.getUserId(token);
            String role = jwtProvider.getRole(token);

            System.out.println("userID : "+ userId);
            System.out.println("role : " + role);

            UserDetails userDetails;

            // role에 따라 다른 테이블에서 조회
            if ("ADMIN".equals(role)) {
                userDetails = userDetailsService
                        .loadAdminById(userId);
            } else {
                userDetails = userDetailsService
                        .loadUserById(userId);
            }
            System.out.println("userDetails : "+ userDetails);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null,
                            userDetails.getAuthorities());

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);
        } else {
            System.out.println("토큰 유효하지 않음");
        }

        filterChain.doFilter(request, response);
    }

    // Authorization 헤더에서 Bearer 토큰 추출
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken)
                && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}