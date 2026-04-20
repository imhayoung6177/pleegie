package market_it.pleegie.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.domain.recipe.dto.RecipeResponse;
import market_it.pleegie.service.RecipeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    // 레시피 상세 조회 API (동시에 Redis에 '최근 본 목록'으로 기록)
    @GetMapping("/{recipeId}")
    public ResponseEntity<RecipeResponse> getRecipeDetail(@PathVariable Long recipeId, @RequestParam Long userId) {

        // 서비스에서 DB 조회하여 DTO로 변환해서 가져오기
         RecipeResponse response = recipeService.getRecipeDetail(recipeId);

        // 동시에 Redis에 '최근 본 레시피'로 등록
        recipeService.addRecentRecipe(userId, recipeId);

        // 최종적으로 상세 데이터를 리액트에 반환
        return ResponseEntity.ok(response);
    }

    // 최근 본 레시피 목록 조회 API (Redis에서 ID를 뽑아 DB의 상세정보와 매칭하여 반환)
    @GetMapping("/recent")
    public ResponseEntity<List<RecipeResponse>> getRecentRecipes(@RequestParam Long userId) {
        // 서비스에서 만든 세부 정보 포함 목록 조회 메서드 호출
        List<RecipeResponse> responses = recipeService.getRecentRecipeDetails(userId);

        return ResponseEntity.ok(responses);
    }

}
