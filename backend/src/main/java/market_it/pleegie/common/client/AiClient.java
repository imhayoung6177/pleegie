package market_it.pleegie.common.client;

import market_it.pleegie.chat.dto.AiRouterResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
public class AiClient {

    private final RestTemplate restTemplate;

    @Value("${ai.python-server-url}")
    private String aiServerUrl;

    public AiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    //LLM Router 사용자 의도 파악
    public AiRouterResponse detectIntent(String message){
        String url = aiServerUrl + "/api/ai";
        Map<String,String> body = Map.of("message",message);
        return restTemplate.postForObject(url,body, AiRouterResponse.class);
    }

    //챗봇 응답
    public AiRouterResponse chat(String message, String sessionId){
        String url = aiServerUrl +"/chatbot";
        Map<String,String> body = Map.of(
                "message",message,
                "session_id",sessionId
        );
        return restTemplate.postForObject(url,body,AiRouterResponse.class);
    }

    //냉장고 재료 기반 레시피 추천
    public AiRouterResponse recommendByFridge(List<String> ingredients, List<String> expiringIngredients){
        String url = aiServerUrl + "/recipe/recommend";
        Map<String,Object> body = Map.of(
                "ingredients",ingredients
                ,"expiring_ingredients",expiringIngredients
        );
        return restTemplate.postForObject(url,body,AiRouterResponse.class);
    }

    //레시피 검색
    public AiRouterResponse searchRecipe(String query){
        String url = aiServerUrl + "/recipe/search";
        Map<String,String> body = Map.of("query",query);
        return restTemplate.postForObject(url,body,AiRouterResponse.class);
    }

    public AiRouterResponse marketGuide(String message) {
        String url = aiServerUrl + "api/ai/market-guide";
        Map<String, String> body = Map.of("message", message);
        return restTemplate.postForObject(url, body, AiRouterResponse.class);
    }

}
