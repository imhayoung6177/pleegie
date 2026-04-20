package market_it.pleegie.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/* WebConfig : CORS 설정 , 리액트와 스프링 부트 포트가 다르기에 이 설정이 없으면 데이터 통신 불가능  */
@Configuration //스프링의 설정 클래스 선언
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") //api로 시작하는 모든 요청들에 대해서 이 작업을 수행한다
                .allowedOrigins("http://localhost:5173") // 리액트 주소로 접속을 허용한다 !!
                .allowCredentials(true) // 세션 쿠키(JSESSIONID)를 주고 받을 수 있도록 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE"); // 헏용할 HTTP 메서드 정의
    }
}
