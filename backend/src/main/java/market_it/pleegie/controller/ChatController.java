package market_it.pleegie.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.domain.AiRouterResponse;
import market_it.pleegie.service.AiService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class ChatController {
    private final AiService aiService;
//    private final MarketService marketService;
//    private final RecipeService recipeService;
//    private final FridgeService fridgeService;

    @PostMapping("/chatbot")
    public String handleChat(@RequestBody String userMessage){
        AiRouterResponse response = aiService.getRoutingResult(userMessage);

        if(response==null) return "AI 서버와 연결할 수 없습니다.";

        String target = response.getTarget();

        return  switch (target){
            case "TargetTeam.MARKET" -> "시장 정보 로직으로 연결합니다.";
            case "TargetTeam.RECIPE" -> "레시피 로직으로 연결합니다.";
            case "TargetTeam.REFRIGERATOR" -> "냉장고 관리 로직으로 연결합니다.";
            default -> "안녕하세요 PleegieChatBot입니다. 무엇을 도와드릴까요?";

        };
    }
}
