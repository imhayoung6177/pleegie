package market_it.pleegie.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. 🚀 CORS 설정을 활성화합니다.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 2. CSRF 보안 기능을 끕니다 (테스트 단계).
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    // 리액트 마을(5173번 포트) 손님을 허용하는 상세 지침서
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 리액트 서버 주소를 허용합니다.
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        // 모든 방식(GET, POST, PUT, DELETE 등)을 허용합니다.
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // 모든 헤더(데이터 타입 등)를 허용합니다.
        config.setAllowedHeaders(List.of("*"));
        // 내보낼 때 자격 증명(쿠키 등)을 허용할지 설정합니다.
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // 모든 경로에 대해 이 설정을 적용합니다.
        return source;
    }
}