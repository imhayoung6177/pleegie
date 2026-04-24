package market_it.pleegie.recipe.controller;

import lombok.RequiredArgsConstructor;
import market_it.pleegie.common.response.ApiResponse;
import market_it.pleegie.common.security.CustomUserDetails;
import market_it.pleegie.recipe.dto.*;
import market_it.pleegie.recipe.service.RecipeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    // 냉장고 기반 레시피 추천
    @GetMapping("/recipe/recommend")
    public ResponseEntity<ApiResponse<RecipeRecommendResponse>>
    recommend(
            @AuthenticationPrincipal
            CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        recipeService.recommendByFridge(
                                userDetails.getUserId())));
    }

    // 먹고싶은 메뉴 검색
    @GetMapping("/recipe/search")
    public ResponseEntity<ApiResponse<RecipeRecommendResponse>>
    search(@RequestParam String query) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        recipeService.searchRecipe(query)));
    }

    // 레시피북 저장
    @PostMapping("/user/recipebook")
    public ResponseEntity<ApiResponse<RecipeBookSaveResponse>>
    saveToRecipeBook(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @RequestBody RecipeBookSaveRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        recipeService.saveToRecipeBook(
                                userDetails.getUserId(),
                                request)));
    }

    // 레시피북 목록 조회
    @GetMapping("/user/recipebook")
    public ResponseEntity<ApiResponse<List<RecipeBookSaveResponse>>>
    getRecipeBook(
            @AuthenticationPrincipal
            CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        recipeService.getRecipeBook(
                                userDetails.getUserId())));
    }

    // 레시피북 삭제
    @DeleteMapping("/user/recipebook/{id}")
    public ResponseEntity<ApiResponse<Void>>
    deleteFromRecipeBook(
            @AuthenticationPrincipal
            CustomUserDetails userDetails,
            @PathVariable Long id) {
        recipeService.deleteFromRecipeBook(
                userDetails.getUserId(), id);
        return ResponseEntity.ok(
                ApiResponse.ok(
                        "레시피가 삭제되었습니다", null));
    }
}