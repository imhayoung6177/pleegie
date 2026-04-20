package market_it.pleegie.service;

import market_it.pleegie.domain.AiRouterResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.PublicKey;
import java.util.HashMap;
import java.util.Map;

@Service
public class AiService {
    private final String AI_SERVER_URL = "http://localhost:8000/ai/route";

    public AiRouterResponse getRoutingResult(String message){
        RestTemplate restTemplate = new RestTemplate();

        Map<String, String> request = new HashMap<>();
        request.put("message", message);

        try {
            return restTemplate.postForObject(AI_SERVER_URL,request,AiRouterResponse.class);
        }catch (Exception e){
            System.out.println("AI 서버 연결 실패 : "+e.getMessage());
            return null;
        }
    }
}
