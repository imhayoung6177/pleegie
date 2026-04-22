package market_it.pleegie.chat.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.chat.dto.AiRouterResponse;
import market_it.pleegie.chat.dto.ChatRequest;
import market_it.pleegie.common.client.AiClient;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final AiClient aiClient;

    public AiRouterResponse chat(ChatRequest request){

        //사용자 메시지 의도 파악
        AiRouterResponse intentResponse = aiClient.detectIntent(request.getMessage());

        // 의도에 따라 적절한 AI기능으로 라우팅
        return switch (intentResponse.getIntent()){
            case "RECIPE_RECOMMEND" -> aiClient.recommendByFridge(null); //추후 냉장고 재료 전달
            case "RECIPE_SEARCH" -> aiClient.searchRecipe(request.getMessage());
            default -> intentResponse; //chatbot 등 일반대화
        };
    }
}
