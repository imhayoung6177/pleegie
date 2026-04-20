package market_it.pleegie.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.domain.AiRouterResponse;
import market_it.pleegie.domain.ChatRequest;
import market_it.pleegie.service.AiService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> handleChat(@RequestBody ChatRequest request){
        AiRouterResponse response = aiService.getRoutingResult(request.getMessage());

        return  switch (response.getTarget()){
//            case "TargetTeam.MARKET" -> ResponseEntity.ok(marketService.findSalesInfo(request.getMessage()));
//            case "TargetTeam.RECIPE" -> ResponseEntity.ok(recipeService.recommendRecipe(request.getMessage()));
//            case "TargetTeam.REFRIGERATOR" -> ResponseEntity.ok(fridgeService.manageInventory(request.getMessage()));
            default -> ResponseEntity.ok("안녕하세요 PleegieChatBot입니다. 무엇을 도와드릴까요?");

        };
    }
}
