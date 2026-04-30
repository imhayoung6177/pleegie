package market_it.pleegie.recipe.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import market_it.pleegie.common.client.AiClient;
import market_it.pleegie.common.exception.CustomException;
import market_it.pleegie.common.exception.ErrorCode;
import market_it.pleegie.fridge.repository.FridgeItemRepository;
import market_it.pleegie.fridge.repository.FridgeRepository;
import market_it.pleegie.item.repository.ItemMasterRepository;
import market_it.pleegie.market.entity.Market;
import market_it.pleegie.market.repository.MarketItemRepository;
import market_it.pleegie.market.repository.MarketRepository;
import market_it.pleegie.recipe.dto.*;
import market_it.pleegie.recipe.entity.RecipeBook;
import market_it.pleegie.recipe.repository.RecipeBookRepository;
import market_it.pleegie.user.entity.User;
import market_it.pleegie.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecipeService {

    private final AiClient aiClient;
    private final FridgeRepository fridgeRepository;
    private final FridgeItemRepository fridgeItemRepository;
    private final RecipeBookRepository recipeBookRepository;
    private final UserRepository userRepository;
    private final MarketRepository marketRepository;
    private final MarketItemRepository marketItemRepository;
    private final ItemMasterRepository itemMasterRepository;

    // ── 냉장고 기반 레시피 추천 ───────────────

    public RecipeRecommendResponse recommendByFridge(Long userId) {

        // 냉장고 재료 조회
        Long fridgeId = fridgeRepository
                .findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FRIDGE_NOT_FOUND))
                .getId();

        // 전체 재료 이름 목록
        List<String> ingredients = fridgeItemRepository
                .findAllByFridgeId(fridgeId)
                .stream()
                .map(fi -> fi.getItemMaster().getName())
                .collect(Collectors.toList());

        // 유통기한 임박 재료 (3일 이내)
        LocalDate targetDate = LocalDate.now().plusDays(3);
        List<String> expiringIngredients = fridgeItemRepository
                .findNearExpiryItems(fridgeId, targetDate)
                .stream()
                .map(fi -> fi.getItemMaster().getName())
                .collect(Collectors.toList());

        // Python AI 서버에 추천 요청
        RecipeRecommendResponse response =
                aiClient.recommendByFridge(
                        ingredients, expiringIngredients);

        // missing_ingredients에서 냉장고 재료 제거
        if (response != null && response.getRecipes() != null) {
            response.getRecipes().forEach(recipe -> {
                if (recipe.getMissingIngredients() != null) {

                    List<String> filtered =
                            recipe.getMissingIngredients()
                                    .stream()
                                    .filter(missing ->
                                            // 포함 관계로 비교
                                            ingredients.stream().noneMatch(
                                                    fridge ->
                                                            fridge.contains(missing) || missing.contains(fridge)
                                            )
                                    )
                                    .collect(Collectors.toList());

                    recipe.setMissingIngredients(filtered);
                }
            });
        }
        return response;
    }

    // ── 냉장고 기반 레시피 추천 ───────────────

    public RecipeRecommendResponse searchRecipe(String query) {
        return aiClient.searchRecipe(query);
    }

    // ── 부족한 재료 시장 검색 ─────────────────────
    public MissingItemResponse findMissingItemsInMarkets(MissingItemRequest request) {
        // 가까운 시장 목록 조회
        List<Market> nearestMarkets = marketRepository.findNearestMarkets(request.getLatitude(), request.getLongitude());

        //상위 5개 시장
        List<Long> marketIds = nearestMarkets.stream().limit(5).map(Market::getId).collect(Collectors.toList());

        // 부족한 재료 -> item_master 매칭
        List<MissingItemResponse.MarketItemInfo> marketItemInfos = new ArrayList<>();

        for (Market market : nearestMarkets.stream().limit(5).collect(Collectors.toList())) {

            List<MissingItemResponse.ItemInfo> itemInfos = new ArrayList<>();

            for (String ingredientName : request.getMissingIngredients()) {
                // 재료명 정제 - 용량 제거
                String cleanName = ingredientName
                        .replaceAll("\\s*\\d+(\\.\\d+)?\\s*(g|ml|kg|L|개|큰술|작은술|컵|줄기|알|장|마리).*", "")
                                .replaceAll("\\s*:.*","")
                                        .trim();
                // item_master에서 재료 찾기
                itemMasterRepository.findByNameContaining(cleanName).stream()
                                .findFirst()
                        .ifPresent(itemMaster -> {
                    // 해당 시장에서 재료 판매 여부 확인
                    marketItemRepository.findByMarketIdsAndItemMasterId(marketIds, itemMaster.getId())
                            .stream()
                            .filter(mi -> mi.getMarket()
                                    .getId().equals(market.getId()))
                            .findFirst()
                            .ifPresent(mi -> itemInfos.add(
                                    new MissingItemResponse.ItemInfo(
                                            mi.getId(),
                                            mi.getName(),
                                            mi.getOriginalPrice(),
                                            mi.getDiscountPrice(),
                                            mi.getDiscountRate(),
                                            mi.getOnSale()
                                    )
                            ));
                });
            }
            // 판매중인 재료가 있는 시장만 추가
            if (!itemInfos.isEmpty()) {
                marketItemInfos.add(new MissingItemResponse.MarketItemInfo(
                        market.getId(),
                        market.getName(),
                        market.getLatitude(),
                        market.getLongitude(),
                        itemInfos
                ));
            }
        }
        return new MissingItemResponse(marketItemInfos);
    }

    // ── 레시피북 저장 ─────────────────────────

    @Transactional
    public RecipeBookSaveResponse saveToRecipeBook(Long userId, RecipeBookSaveRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 이미 저장한 레시피인지 확인
        // title로 중복 체크
        boolean exists = recipeBookRepository
                .existsByUserIdAndTitle(userId, request.getTitle());

        if (exists) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        RecipeBook recipeBook = RecipeBook.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .ingredients(String.join(",", request.getIngredients()))
                .build();

        recipeBookRepository.save(recipeBook);

        return RecipeBookSaveResponse.from(recipeBook);
    }

    // ── 레시피북 저장 ─────────────────────────

    public List<RecipeBookSaveResponse> getRecipeBook(Long userId) {
        return recipeBookRepository
                .findAllByUserId(userId)
                .stream()
                .map(RecipeBookSaveResponse::from)
                .collect(Collectors.toList());
    }

    // ── 레시피북 삭제 ─────────────────────────

    @Transactional
    public void deleteFromRecipeBook(Long userId, Long recipeBookId) {
        RecipeBook recipeBook = recipeBookRepository
                .findById(recipeBookId)
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INPUT));

        // 본인 레시피북인지 확인
        if (!recipeBook.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        recipeBookRepository.delete(recipeBook);
    }
}
