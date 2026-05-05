import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/user/RecipeRecommendPage.css";
import KakaoMap from "../../components/ui/KakaoMap";

/**
 * RecipeRecommendPage.jsx
 *
 * ✅ 데이터 흐름:
 * 1단계: GET /recipe/recommend
 *   → Spring RecipeController → Python AI 서버 → 레시피 추천 결과
 *   → RecipeItem { title, description, ingredients[], missing_ingredients[],
 *                  match_score(0~1), has_expiring(bool), cooking_steps[], sauce_steps[] }
 *
 * 2단계: POST /user/recipebook
 *   → Spring RecipeController.saveToRecipeBook()
 *   → RecipeBookSaveRequest { title, description, ingredients[] }
 *   → 백엔드 내부에서 Recipe 자동 생성 후 RecipeBook 저장
 */

export default function RecipeRecommendPage() {
  const navigate = useNavigate();

  // ── 상태 관리 ──────────────────────────────────────────────
  const [recipes, setRecipes] = useState([]); // AI 추천 레시피 목록
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [errorMsg, setErrorMsg] = useState(""); // 에러 메시지
  const [selectedRecipe, setSelectedRecipe] = useState(null); // 선택된 레시피 (상세 보기용)

  // 시장 지도 관련 상태 (근처 시장에서 구매하기 버튼 클릭 시 사용)
  const [showMap, setShowMap] = useState(false);
  const [mapMarkets, setMapMarkets] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);

  // ── JWT 인증 헤더 ───────────────────────────────────────────
  // Spring Security에서 토큰 검증에 사용
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    "Content-Type": "application/json",
  });

  // ── 레시피 추천 요청 ────────────────────────────────────────
  /**
   * [자바 연동] GET /recipe/recommend
   * → RecipeController.recommend(@AuthUser Long userId)
   * → RecipeService.recommendByFridge(userId)
   *   → 냉장고 재료 조회 → Python AI 서버 호출 → 결과 반환
   */
  const fetchRecommend = async () => {
    setLoading(true);
    setErrorMsg("");
    setRecipes([]);

    try {
      const recipeRes = await fetch("/recipe/recommend", {
        method: "GET",
        headers: getAuthHeaders(),
      });

      // 401: 로그인 만료 → 로그인 페이지로 리다이렉트
      if (recipeRes.status === 401) {
        navigate("/user/login");
        return;
      }

      if (!recipeRes.ok) {
        throw new Error(
          "레시피 추천 서버 오류. Python 서버가 실행 중인지 확인해주세요.",
        );
      }

      // ApiResponse<RecipeRecommendResponse> 구조: { success, message, data: { recipes: [] } }
      const recipeJson = await recipeRes.json();
      const recipeList = recipeJson.data?.recipes || [];

      if (recipeList.length === 0) {
        setErrorMsg(
          "냉장고 재료로 만들 수 있는 레시피를 찾지 못했어요. 재료를 더 추가해보세요!",
        );
      } else {
        setRecipes(recipeList);
      }
    } catch (err) {
      console.error("레시피 추천 실패:", err);
      setErrorMsg(err.message || "알 수 없는 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  // ── 레시피북 저장 ───────────────────────────────────────────
  /**
   * [자바 연동] POST /user/recipebook
   * → RecipeController.saveToRecipeBook(@AuthUser Long userId, @RequestBody RecipeBookSaveRequest)
   * → RecipeService.saveToRecipeBook(userId, request)
   *   ① 중복 체크 (title 기준)
   *   ② Recipe 테이블에 먼저 저장 (recipe_id 생성)
   *   ③ RecipeBook 테이블에 저장 (recipe_id 연결)
   *
   * RecipeBookSaveRequest 필드: title, description, ingredients(List<String>)
   */
  // 레시피북에 레시피 저장
  // 레시피북에 레시피 저장
  // ✅ [수정 포인트] cooking_steps와 sauce_steps를 description에 합쳐서 저장
  // → 레시피북에서 불러올 때 parseDescription()으로 분리하여 사진처럼 요리법 표시 가능
  const saveRecipe = async (recipe) => {
    try {
      // 1. 기본 설명
      let combinedDescription = recipe.description || "";

      // 2. 요리법 합치기
      if (
        Array.isArray(recipe.cooking_steps) &&
        recipe.cooking_steps.length > 0
      ) {
        combinedDescription += `\n\n[🍳 조리법]\n${recipe.cooking_steps.join("\n")}`;
      }

      // 3. 소스/양념 합치기
      if (Array.isArray(recipe.sauce_steps) && recipe.sauce_steps.length > 0) {
        combinedDescription += `\n\n[🥣 소스/양념]\n${recipe.sauce_steps.join("\n")}`;
      }

      // 4. 부족한 재료 합치기 (레시피북 상세에서 표시하기 위해)
      if (
        Array.isArray(recipe.missing_ingredients) &&
        recipe.missing_ingredients.length > 0
      ) {
        combinedDescription += `\n\n[🛒 부족한 재료]\n${recipe.missing_ingredients.join("\n")}`;
      }

      const res = await fetch("/user/recipebook", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: recipe.title,
          description: combinedDescription, // 요리법 + 부족재료 모두 포함
          ingredients: recipe.ingredients,
        }),
      });

      if (res.ok) {
        alert("레시피북에 저장되었습니다! 📖");
      } else {
        const json = await res.json();
        alert(json.message || "저장 실패");
      }
    } catch {
      alert("저장 중 오류가 발생했어요.");
    }
  };

  // 컴포넌트 마운트 시 추천 레시피 자동 로드
  useEffect(() => {
    const init = async () => {
      await fetchRecommend();
    };
    init();
  }, []);

  // ── 렌더링 ────────────────────────────────────────────────────
  return (
    <div className="rrp-page">
      {/* ── 헤더 ── */}
      <div className="rrp-header">
        <button className="rrp-header-back" onClick={() => navigate(-1)}>
          ←
        </button>
        <span className="rrp-header-title">
          {selectedRecipe ? "레시피 상세" : "AI 추천 레시피"}
        </span>
      </div>

      <div className="rrp-body">
        {/* ── 로딩 ── */}
        {loading && (
          <div className="rrp-loading">
            <div className="rrp-loading-spinner" />
            <p>AI가 냉장고 재료를 분석하여 레시피를 생성 중입니다...</p>
          </div>
        )}

        {/* ── 에러 ── */}
        {!loading && errorMsg && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🥲</div>
            <p style={{ color: "#8a7a60", marginBottom: "20px" }}>{errorMsg}</p>
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                onClick={fetchRecommend}
                style={{
                  padding: "12px 24px",
                  background: "#fdd537",
                  color: "#2a1f0e",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                다시 시도
              </button>
              <button
                onClick={() => navigate("/user/fridge")}
                style={{
                  padding: "12px 24px",
                  background: "transparent",
                  color: "#2a1f0e",
                  border: "1.5px solid #ddd",
                  fontWeight: 700,
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
              >
                냉장고로 이동
              </button>
            </div>
          </div>
        )}

        {/* ── 레시피 목록 ── */}
        {!loading && !errorMsg && !selectedRecipe && (
          <div className="rrp-recipe-list">
            {recipes.map((r, idx) => (
              <div
                key={idx}
                className="rrp-recipe-card"
                onClick={() => setSelectedRecipe(r)}
              >
                <div className="rrp-card-info">
                  <strong className="rrp-card-name">
                    {/* has_expiring: 유통기한 임박 재료 포함 시 불 아이콘 */}
                    {r.has_expiring ? "🔥 " : "🥗 "}
                    {r.title}
                  </strong>
                  <p className="rrp-card-desc">{r.description}</p>

                  {/* match_score: 0.0~1.0 → % 변환 후 게이지 바로 표시 */}
                  <div style={{ marginTop: "6px" }}>
                    <div
                      style={{
                        height: "4px",
                        background: "#f0ede8",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.round(r.match_score * 100)}%`,
                          background:
                            r.match_score >= 0.7 ? "#4CAF50" : "#fdd537",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "black",
                        margin: "3px 0 0",
                      }}
                    >
                      재료 {Math.round(r.match_score * 100)}% 보유
                    </p>
                  </div>

                  {/* missing_ingredients: 부족한 재료 목록 표시 */}
                  {r.missing_ingredients?.length > 0 && (
                    <p
                      style={{
                        fontSize: "0.76rem",
                        color: "black",
                        margin: "4px 0 0",
                      }}
                    >
                      ⚠️ 부족: {r.missing_ingredients.join(", ")}
                    </p>
                  )}
                </div>
                <span className="rrp-card-arrow">〉</span>
              </div>
            ))}
          </div>
        )}

        {/* ── 레시피 상세 ── */}
        {!loading && !errorMsg && selectedRecipe && (
          <div className="rrp-detail">
            {/* 목록으로 돌아가기 버튼 */}
            <button
              className="rrp-back-btn"
              onClick={() => setSelectedRecipe(null)}
            >
              ← 목록으로
            </button>

            {/* 레시피 제목 */}
            <h2 className="detail-title">{selectedRecipe.title}</h2>

            {/* 유통기한 임박 재료 포함 배지 */}
            {selectedRecipe.has_expiring && (
              <div
                style={{
                  display: "inline-block",
                  background: "#fff3e0",
                  color: "#000000",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                🔥 유통기한 임박 재료 활용 레시피
              </div>
            )}

            {/* 냉장고 재료 매칭률 게이지 바 */}
            <div
              style={{
                background: "#f8f5f0",
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "#8a7a60",
                  marginBottom: "6px",
                }}
              >
                냉장고 재료 매칭률
              </div>
              <div
                style={{
                  height: "8px",
                  background: "#e8e3db",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.round(selectedRecipe.match_score * 100)}%`,
                    background:
                      selectedRecipe.match_score >= 0.7 ? "#4CAF50" : "#fdd537",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#2a1f0e",
                  marginTop: "6px",
                }}
              >
                {Math.round(selectedRecipe.match_score * 100)}% 보유
              </div>
            </div>

            {/* 레시피 설명 */}
            <div className="detail-section">
              <h3>💬 레시피 설명</h3>
              <p style={{ color: "#5a4a32", lineHeight: 1.6 }}>
                {selectedRecipe.description}
              </p>
            </div>

            {/* 필요 재료 전체 (보유: 초록, 부족: 노란) */}
            <div className="detail-section">
              <h3>📋 필요 재료</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {selectedRecipe.ingredients?.map((ing, i) => {
                  // 부족한 재료는 노란 테두리, 보유 재료는 초록 테두리
                  const isMissing = selectedRecipe.missing_ingredients?.some(
                    (missing) =>
                      missing === ing ||
                      missing.includes(ing) ||
                      ing.includes(missing),
                  );
                  return (
                    <span
                      key={i}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        background: isMissing ? "#fff3e0" : "#e8f5e9",
                        color: "#000000",
                        border: `1px solid ${isMissing ? "#fdd537" : "#4CAF50"}`,
                      }}
                    >
                      {isMissing ? "❌ " : "✅ "}
                      {ing}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* 부족한 재료 강조 + 근처 시장에서 구매하기 버튼 */}
            {selectedRecipe.missing_ingredients?.length > 0 && (
              <div className="detail-section">
                <h3>🛒 부족한 재료</h3>
                <p
                  className="missing-alert"
                  style={{ color: "#5a4a32", lineHeight: 1.6 }}
                >
                  ⚠️ {selectedRecipe.missing_ingredients.join(", ")}
                </p>
                {/* 
                  [자바 연동] POST /market/missing-items
                  → RecipeController.findMissingItems(@RequestBody MissingItemRequest)
                  → RecipeService.findMissingItemsInMarkets(request)
                  → 가까운 시장 5개에서 부족한 재료 판매 여부 확인
                */}
                <button
                  onClick={async () => {
                    setMapLoading(true);
                    setShowMap(true);

                    // 현재 위치 가져오기 (실패 시 서울 시청 좌표로 대체)
                    const getLocation = () =>
                      new Promise((resolve) => {
                        navigator.geolocation.getCurrentPosition(
                          (pos) =>
                            resolve({
                              latitude: pos.coords.latitude,
                              longitude: pos.coords.longitude,
                            }),
                          () =>
                            resolve({ latitude: 37.5665, longitude: 126.978 }),
                        );
                      });

                    const location = await getLocation();

                    try {
                      const res = await fetch("/market/missing-items", {
                        method: "POST",
                        headers: getAuthHeaders(),
                        body: JSON.stringify({
                          missingIngredients:
                            selectedRecipe.missing_ingredients,
                          latitude: location.latitude,
                          longitude: location.longitude,
                        }),
                      });
                      const json = await res.json();
                      setMapMarkets(json.data?.markets || []);
                    } catch (err) {
                      console.error("시장 검색 실패:", err);
                    } finally {
                      setMapLoading(false);
                    }
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#fdd537",
                    color: "#2a1f0e",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    marginTop: "8px",
                  }}
                >
                  🏪 근처 시장에서 구매하기
                </button>
              </div>
            )}

            {/* 요리법 (cooking_steps: 배열 또는 문자열 모두 대응) */}
            <div className="detail-section">
              <h3>🍳 요리법</h3>
              <ol
                style={{ paddingLeft: "20px", color: "#5a4a32", lineHeight: 2 }}
              >
                {Array.isArray(selectedRecipe.cooking_steps) ? (
                  selectedRecipe.cooking_steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))
                ) : (
                  <li>{selectedRecipe.cooking_steps}</li>
                )}
              </ol>
            </div>

            {/* 소스/양념 만드는 법 (있을 경우만 표시) */}
            {selectedRecipe.sauce_steps?.length > 0 && (
              <div className="detail-section">
                <h3>🥣 소스/양념 만드는 법</h3>
                <ol
                  style={{
                    paddingLeft: "20px",
                    color: "#5a4a32",
                    lineHeight: 2,
                  }}
                >
                  {selectedRecipe.sauce_steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* 레시피북 저장 버튼 */}
            <div className="detail-section">
              <button
                onClick={() => saveRecipe(selectedRecipe)}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#fdd537",
                  color: "#2a1f0e",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: "16px",
                }}
              >
                📖 레시피북에 저장
              </button>
            </div>
          </div>
        )}
      </div>
      {/* 카카오 맵 모달*/}
      {showMap && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              background: "#fff",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #eee",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "1rem" }}>
                🏪 근처 시장 찾기
              </span>
              <button
                onClick={() => setShowMap(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {mapLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>시장을 검색 중입니다...</p>
              </div>
            ) : (
              <>
                <KakaoMap markets={mapMarkets} />
                <div
                  style={{
                    overflowY: "auto",
                    padding: "16px",
                    flex: 1,
                  }}
                >
                  {mapMarkets.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#888" }}>
                      근처 시장에 해당 재료가 없어요
                    </p>
                  ) : (
                    mapMarkets.map((market, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "#f8f5f0",
                          borderRadius: "12px",
                          padding: "12px 16px",
                          marginBottom: "10px",
                        }}
                      >
                        <strong>🏪 {market.marketName}</strong>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                            marginTop: "8px",
                          }}
                        >
                          {market.items?.map((item, i) => (
                            <span
                              key={i}
                              style={{
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "0.8rem",
                                background: item.onSale ? "#fff3e0" : "#e8f5e9",
                                color: item.onSale ? "#FF6B35" : "#4CAF50",
                                border: `1px solid ${
                                  item.onSale ? "#FF6B35" : "#4CAF50"
                                }`,
                              }}
                            >
                              {item.onSale ? "🔴 " : ""}
                              {item.name}{" "}
                              {item.onSale
                                ? `${item.discountPrice?.toLocaleString()}원`
                                : `${item.originalPrice?.toLocaleString()}원`}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
