package market_it.pleegie.chat.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.chat.dto.AiRouterResponse;
import market_it.pleegie.chat.dto.ChatRequest;
import market_it.pleegie.common.client.AiClient;
import market_it.pleegie.common.exception.CustomException;
import market_it.pleegie.common.exception.ErrorCode;
import market_it.pleegie.fridge.entity.FridgeItem;
import market_it.pleegie.fridge.repository.FridgeItemRepository;
import market_it.pleegie.fridge.repository.FridgeRepository;
import market_it.pleegie.recipe.dto.RecipeRecommendResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {
    private final AiClient aiClient;
    private final FridgeRepository fridgeRepository;
    private final FridgeItemRepository fridgeItemRepository;

    public Object chat(Long userId, ChatRequest request){

        //사용자 메시지 의도 파악
        AiRouterResponse intentResponse = aiClient.detectIntent(request.getMessage());

        // 의도에 따라 적절한 AI기능으로 라우팅
        return switch (intentResponse.getIntent()){
            case "RECIPE_RECOMMEND" -> {

                // 냉장고 ID 조회
                Long fridgeId = fridgeRepository
                        .findByUserId(userId)
                        .orElseThrow(() -> new CustomException(ErrorCode.FRIDGE_NOT_FOUND))
                        .getId();

                // 냉장고 전체 재료 이름 목록
                List<String> ingredients = fridgeItemRepository
                        .findAllByFridgeId(fridgeId)
                        .stream()
                        .map(fi -> fi.getItemMaster().getName())
                        .collect(Collectors.toList());

                // 유통기한 임박 재료 (3일 이내)
                LocalDate targetDate =
                        LocalDate.now().plusDays(3);
                List<String> expiringIngredients =
                        fridgeItemRepository
                                .findNearExpiryItems(
                                        fridgeId, targetDate
                                )
                                .stream()
                                .map(fi -> fi.getItemMaster().getName())
                                .collect(Collectors.toList());

                yield aiClient.recommendByFridge(
                        ingredients, expiringIngredients
                );
            }
            case "RECIPE_SEARCH" -> aiClient.searchRecipe(request.getMessage());
            case "MARKET_GUIDE"  -> aiClient.marketGuide(request.getMessage());
            default -> aiClient.chat(request.getMessage(),String.valueOf(userId)); //chatbot 등 일반대화
        };
    }
}
