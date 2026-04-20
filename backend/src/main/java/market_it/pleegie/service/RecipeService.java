package market_it.pleegie.service;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.domain.recipe.dto.RecipeItemRequest;
import market_it.pleegie.domain.recipe.dto.RecipeResponse;
import market_it.pleegie.domain.recipe.entity.Recipe;
import market_it.pleegie.domain.recipe.entity.RecipeItem;
import market_it.pleegie.domain.user.User;
import market_it.pleegie.repository.recipe.RecipeItemRepository;
import market_it.pleegie.repository.recipe.RecipeRepository;
import market_it.pleegie.repository.user.UserRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeItemRepository recipeItemRepository;
    private final UserRepository userRepository; // 작성자 확인용
    private final RedisTemplate<String, Object> redisTemplate;

    // 레시피 등록 기능(DB)
    public Long createRecipe(Long userId, String title, String content, List<RecipeItemRequest> items) {
        // 작성자(User) 존재 여부 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 없습니다."));

        // Recipe 엔티티 생성 및 저장
        Recipe recipe = Recipe.builder()
                .user(user)
                .title(title)
                .content(content)
                .build();
        Recipe savedRecipe = recipeRepository.save(recipe);

        // 함께 전달된 재료(Items) 저장
        for (RecipeItemRequest itemDto : items) {
            RecipeItem recipeItem = RecipeItem.builder()
                    .recipe(savedRecipe)
                    .name(itemDto.getName())
                    .category(itemDto.getCategory())
                    // itemMasterId는 추후에 AI와 협업할 때의 연결고리
                    .build();
            recipeItemRepository.save(recipeItem);
        }
        return savedRecipe.getId();
    }


    // 최근 본 레시피 추가 로직
    public void addRecentRecipe(Long userId, Long recipeId) {
        String key = "recent:recipe:" + userId; // 예: recent:recipe:1

        // 기존에 같은 레시피 ID가 있다면 중복 제거를 위해 일단 삭제
        redisTemplate.opsForList().remove(key, 1, String.valueOf(recipeId));

        //  리스트의 맨 앞에 추가 (가장 최근에 본 것)
        redisTemplate.opsForList().leftPush(key, String.valueOf(recipeId));

        // 최대 10개만 유지 (0번부터 9번까지 남기고 나머지는 삭제)
        redisTemplate.opsForList().trim(key, 0, 9);

        // 유효기간 설정 (예: 3일간 유지)
        redisTemplate.expire(key, 3, TimeUnit.DAYS);
    }

    // 최근 본 레시피 목록 조회
    public List<RecipeResponse> getRecentRecipeDetails(Long userId) {
        // Redis에서 최근 본 ID 리스트 가져오기
        List<String> recentIds = getRecentRecipeIds(userId);

        // ID들을 가지고 DB에서 실제 레시피들 조회
        return recentIds.stream()
                .map(id -> recipeRepository.findById(Long.parseLong(id)).orElse(null))
                .filter(Objects::nonNull) // 혹시 삭제된 레시피가 있을 수 있으니 필터링
                .map(recipe -> RecipeResponse.builder() // DTO로 변환
                        .id(recipe.getId())
                        .title(recipe.getTitle())
                        .writerName(recipe.getUser().getName())
                        .build())
                .collect(Collectors.toList());
    }


    // DB(또는 Redis)에서 가져온 데이터를 RecipeResponse로 변환해주는 로직
    public RecipeResponse getRecipeDetail(Long recipeId) {
        // DB에서 레시피 조회
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 레시피입니다."));

        // 엔티티를 Response DTO로 변환 (Builder 패턴 사용)
        return RecipeResponse.builder()
                .id(recipe.getId())
                .title(recipe.getTitle())
                .content(recipe.getContent())
                .writerName(recipe.getUser().getName()) // 작성자 이름만 추출
                .createdAt(recipe.getCreatedAt())
                .itemNames(recipe.getRecipeItems().stream()
                        .map(RecipeItem::getName)
                        .collect(Collectors.toList()))
                .build();
    }

    // Redis에서 최근 본 레시피 'ID 리스트' 만 가져오기 (내부적으로 사용 혹은 가벼운 정보 필요할 때 사용)
    public List<String> getRecentRecipeIds(Long userId) {
        String key = "recent:recipe:" + userId;
        // 리스트 전체 가져오기
        List<Object> values = redisTemplate.opsForList().range(key, 0, -1);

        if (values == null) return Collections.emptyList();

        return values.stream()
                .map(obj -> (String) obj)
                .collect(Collectors.toList());
    }
}
