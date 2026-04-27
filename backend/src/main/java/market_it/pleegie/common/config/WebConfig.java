package market_it.pleegie.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * [준호 추가] 리액트(SPA)와 스프링 부트 연결 설정
 * 새로고침 시 스프링이 주소를 가로채서 'No static resource' 에러를 내는 것을 방지합니다.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 관리자 관련 모든 화면 주소(/admin/...)가 들어오면
        // 서버에서 파일을 찾지 말고, 리액트의 입구인 index.html로 안내합니다.
        registry.addViewController("/admin/**").setViewName("forward:/index.html");

        // 유저와 마켓 화면도 미리 설정해두면 나중에 편합니다.
        registry.addViewController("/user/**").setViewName("forward:/index.html");
        registry.addViewController("/market/**").setViewName("forward:/index.html");
    }
}