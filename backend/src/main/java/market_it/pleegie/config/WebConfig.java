package market_it.pleegie.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173") // 리액트 주소
                .allowCredentials(true) // 세션 쿠키 허용을 위해 필수
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
