package market_it.pleegie.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration // 이 클래스는 설정을 위한 클래스임을 선언합니다.
public class RestConfig {

    @Bean // 스프링이 이 전화기(RestTemplate)를 관리하도록 'Bean'으로 등록합니다.
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
