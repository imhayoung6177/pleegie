package market_it.pleegie.common.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.security.oauth.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor

public class SecurityConfig {

    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService customUserDetailsService;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http)
            throws Exception {
        http
                // CSRF 비활성화 (JWT 사용)
                .csrf(AbstractHttpConfigurer::disable)

                // CORS 설정
                .cors(cors -> cors.configurationSource(
                        corsConfigurationSource()))

                // 세션 미사용 (JWT 사용)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))

                // URL별 접근 권한
                .authorizeHttpRequests(auth -> auth

                        // 누구나 접근 가능
                        .requestMatchers(
                                "/",
                                "/intro",
                                "/user/login",
                                "/user/signup",
                                "/market/login",
                                "/market/signup",
                                "/admin/login",
                                "/api/admin/login",
                                "/recipe/missing-items",
                                "/market/missing-items"
//                                "/swagger-ui/**", //swagger테스트 후 삭제할게요 (하영) build.gradle도 수정 필요
//                                "/v3/api-docs/**"
                        ).permitAll()

                        // OAuth2 콜백 허용
                        .requestMatchers(
                                "/login/oauth2/**",
                                "/oauth2/**"
                        ).permitAll()

                        // 관리자만 접근 가능[준호 추가]
                        .requestMatchers("/api/admin/login").permitAll()
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // 사업자만 접근 가능
                        .requestMatchers(
                                HttpMethod.POST, "/market/items/**")
                        .hasRole("MARKET")
                        .requestMatchers(
                                HttpMethod.PUT, "/market/items/**")
                        .hasRole("MARKET")
                        .requestMatchers(
                                HttpMethod.DELETE, "/market/items/**")
                        .hasRole("MARKET")

                        // 나머지는 로그인 필요
                        .anyRequest().authenticated()
                )

                // OAuth2 로그인 설정
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService))
                        .successHandler(oAuth2SuccessHandler())
                )

                // [준호 추가] 인증 실패 시 안내데스크 설정 (Exception Handling)
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            // 핵심: 주소를 강제로 옮기지(Redirect) 않습니다!
                            // 대신 리액트에게 "너 지금 인증 안 됐어(401)"라고 신호만 보냅니다.
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"success\":false, \"message\":\"인증이 필요합니다.\"}");
                        })
                )

                // JWT 필터 추가
                .addFilterBefore(
                        new JwtFilter(jwtProvider, customUserDetailsService),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // [준호 추가] 정적 리소스(리액트 화면)는 시큐리티 검사 자체를 생략하게 합니다.
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
                .requestMatchers("/index.html", "/static/**", "/assets/**", "/favicon.ico");
    }

    // OAuth2 로그인 성공 시 JWT 발급
    @Bean
    public OAuth2SuccessHandler oAuth2SuccessHandler() {
        return new OAuth2SuccessHandler(jwtProvider);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // CORS 설정 (React 개발 서버 허용)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173"  // React 개발 서버
        ));
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        return new UrlBasedCorsConfigurationSource() {{
            registerCorsConfiguration("/**", config);
        }};
    }
}