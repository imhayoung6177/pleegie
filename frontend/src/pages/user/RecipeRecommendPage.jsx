import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/user/RecipeRecommendPage.css';
import KakaoMap from '../../components/ui/KakaoMap';

/**
 * RecipeRecommendPage.jsx
 *
 * ✅ 최종 올바른 흐름:
 *
 * 1단계: GET /user/fridge/items
 *   → Spring FridgeController → DB에서 냉장고 재료 조회
 *   → FridgeItemResponse[] { id, name, status, ... }
 *
 * 2단계: POST /recipe/recommend (Python 서버 직접 호출)
 *   → Vite proxy 통해서 Python 포트 8000으로 전달
 *   → RecipeRecommendRequest { ingredients, expiring_ingredients }
 *   → RecipeResponse { recipes: RecipeItem[] }
 *
 * Python RecipeItem 구조:
 *   { title, description, ingredients[], missing_ingredients[],
 *     match_score(0~1), has_expiring(bool) }
 *
 * ✅ 왜 Spring /chatbot 을 안 쓰나?
 *   → Spring ChatService는 LLM 의도 파악 후 재료 조회를 합쳐서 처리
 *   → 불필요한 단계 (detectIntent) 가 추가됨
 *   → Python /recipe/recommend 를 직접 호출하면 더 빠르고 정확함
 */

export default function RecipeRecommendPage() {
  const navigate = useNavigate();
  const [recipes,        setRecipes]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [errorMsg,       setErrorMsg]       = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [showMap, setShowMap] = useState(false);
  const [mapMarkets, setMapMarkets] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
// ==================================================================
//장바구니 연동 함수 (시장에서 구매 가능한 제품을 담기 버튼을 누르면 , 장바구니에 저장이 되도록 구현))
// ==================================================================
  const handleAddToCart = async (item, marketName) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        alert("로그인이 필요한 서비스입니다. 😊");
        navigate('/user/login');
        return;
      }

      // [자바 연동] POST /user/cart 호출
      const response = await fetch('/user/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item.id,
          name: item.name,
          price: item.onSale ? item.discountPrice : item.originalPrice,
          marketName: marketName,
          quantity: 1
        })
      });

      if (response.ok) {
        alert(`🛒 [${marketName}] ${item.name}을(를) 장바구니에 담았습니다!`);
      } else {
        const result = await response.json();
        alert(result.message || "장바구니 담기에 실패했습니다.");
      }
    } catch (err) {
      console.error('장바구니 연동 에러:', err);
      alert("통신 중 오류가 발생했습니다.");
    }
  };
  //============================================================

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  const fetchRecommend = async () => {
    setLoading(true);
    setErrorMsg('');
    setRecipes([]);

    try {
      const recipeRes = await fetch('/recipe/recommend', {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      // 401: 로그인 만료 → 로그인 페이지로 리다이렉트
      if (recipeRes.status === 401) {
        navigate('/user/login');
        return;
      }

      if (!recipeRes.ok) {
        throw new Error('레시피 추천 서버 오류. Python 서버가 실행 중인지 확인해주세요.');
      }

      // ApiResponse<RecipeRecommendResponse> 구조: { success, message, data: { recipes: [] } }
      const recipeJson = await recipeRes.json();
      const recipeList = recipeJson.data?.recipes || [];

      if (recipeList.length === 0) {
        setErrorMsg('냉장고 재료로 만들 수 있는 레시피를 찾지 못했어요. 재료를 더 추가해보세요!');
      } else {
        setRecipes(recipeList);
      }

    } catch (err) {
      console.error('레시피 추천 실패:', err);
      setErrorMsg(err.message || '알 수 없는 오류가 발생했어요.');
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
    let combinedDescription = recipe.description || '';

    // 2. 요리법 합치기
    if (Array.isArray(recipe.cooking_steps) && recipe.cooking_steps.length > 0) {
      combinedDescription += `\n\n[🍳 조리법]\n${recipe.cooking_steps.join('\n')}`;
    }

    // 3. 소스/양념 합치기
    if (Array.isArray(recipe.sauce_steps) && recipe.sauce_steps.length > 0) {
      combinedDescription += `\n\n[🥣 소스/양념]\n${recipe.sauce_steps.join('\n')}`;
    }

    // 4. 부족한 재료 합치기 (레시피북 상세에서 표시하기 위해)
    if (Array.isArray(recipe.missing_ingredients) && recipe.missing_ingredients.length > 0) {
      combinedDescription += `\n\n[🛒 부족한 재료]\n${recipe.missing_ingredients.join('\n')}`;
    }

    const res = await fetch('/user/recipebook', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: recipe.title,
        description: combinedDescription, // 요리법 + 부족재료 모두 포함
        ingredients: recipe.ingredients
      })
    });

    if (res.ok) {
      alert('레시피북에 저장되었습니다! 📖');
    } else {
      const json = await res.json();
      alert(json.message || '저장 실패');
    }
  } catch {
    alert('저장 중 오류가 발생했어요.');
  }
};

  // 컴포넌트 마운트 시 추천 레시피 자동 로드
  useEffect(() => {
    const init = async () => {
      await fetchRecommend();
    };
    init();
  }, []);

  

// ── 렌더링 파트 ────────────────────────────────────────────────────
// 아까는 모달이어서 , 랜더링을 하여서 , 하나의 페이지 같은 느낌을 줄 수 있도록 설정을 하였습니다. 

if (showMap) {
  return (
    <div className="rrp-page" style={{ 
      position: 'relative', 
      height: '100vh', 
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center', 
      alignItems: 'center'      
    }}>
      
      {/* ✅ 하얀색 컨테이너: 왼쪽 레시피 상세와 1:1로 동일한 너비(600px) 적용 */}
      <div style={{
        width: '95%',               
        maxWidth: '600px',          /* 👈 800px에서 600px로 줄여 왼쪽과 크기를 맞춤 */
        height: '90vh',             
        backgroundColor: '#fff',
        borderRadius: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 100
      }}>
        
        {/* ── 헤더 ── */}
        <div style={{
          padding: '18px 25px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1.5px solid #f8f8f8',
          background: '#fff'
        }}>
          <button onClick={() => setShowMap(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#333' }}>←</button>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2a1f0e' }}>주변 시장 검색 결과</span>
          <div style={{ width: '28px' }} />
        </div>

        {/* ── 📍 상단 지도 영역 ── */}
        <div style={{ width: '100%', height: '100%', background: '#f8f8f8', flexShrink: 0, position: 'relative' }}>
          {mapLoading ? (
            <div style={{ textAlign: 'center', paddingTop: '120px', color: '#aaa', fontSize: '0.9rem' }}>주변 정보를 분석 중...</div>
          ) : (
            <KakaoMap markets={mapMarkets} />
          )}
        </div>

        {/* ── 🛒 하단 시장 리스트 영역 ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 25px', background: '#fcfaf7' }}>
          {mapMarkets.length === 0 && !mapLoading ? (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <p style={{ fontSize: '2.5rem', margin: 0 }}>📍</p>
              <p style={{ color: '#999', fontSize: '0.95rem' }}>근처 시장에 재료가 없어요</p>
            </div>
          ) : (
            mapMarkets.map((market, idx) => (
              <div key={idx} style={{
                background: '#fff', borderRadius: '18px', padding: '20px', marginBottom: '15px',
                border: '1px solid #f0ede8', boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
              }}>
                <strong style={{ fontSize: '1.05rem', color: '#2a1f0e', display: 'block', marginBottom: '12px' }}>
                   {market.marketName}
                </strong>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {market.items?.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 0', borderTop: '1px solid #f9f9f9'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#333' }}>
                          {item.onSale && <span style={{ color: '#FF6B35' }}>[특가] </span>}{item.name}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: item.onSale ? '#FF6B35' : '#4CAF50', fontWeight: 600, marginTop: '2px' }}>
                          {item.onSale ? item.discountPrice?.toLocaleString() : item.originalPrice?.toLocaleString()}원
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleAddToCart(item, market.marketName)}
                        style={{
                          padding: '8px 18px', background: '#fdd537', color: '#2a1f0e',
                          border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer'
                        }}
                      >
                        담기
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

  // ── 렌더링 ────────────────────────────────────────────────────
  return (
    <div className="rrp-page">

      {/* ── 헤더 ── */}
      <div className="rrp-header">
        <button className="rrp-header-back" onClick={() => navigate(-1)}>←</button>
        <span className="rrp-header-title">
          {selectedRecipe ? '레시피 상세' : 'AI 추천 레시피'}
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
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🥲</div>
            <p style={{ color: '#8a7a60', marginBottom: '20px' }}>{errorMsg}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={fetchRecommend}
                style={{
                  padding: '12px 24px', background: '#fdd537',
                  color: '#2a1f0e', border: 'none', borderRadius: '12px',
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                다시 시도
              </button>
              <button
                onClick={() => navigate('/user/fridge')}
                style={{
                  padding: '12px 24px', background: 'transparent',
                  color: '#2a1f0e', border: '1.5px solid #ddd', fontWeight: 700,
                  borderRadius: '12px', cursor: 'pointer',
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
                    {r.has_expiring ? '🔥 ' : '🥗 '}
                    {r.title}
                  </strong>
                  <p className="rrp-card-desc">{r.description}</p>

                  {/* match_score: 0.0~1.0 → % 변환 후 게이지 바로 표시 */}
                  <div style={{ marginTop: '6px' }}>
                    <div style={{
                      height: '4px', background: '#f0ede8',
                      borderRadius: '4px', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.round(r.match_score * 100)}%`,
                        background: r.match_score >= 0.7 ? '#4CAF50' : '#fdd537',
                        borderRadius: '4px',
                      }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'black', margin: '3px 0 0' }}>
                      재료 {Math.round(r.match_score * 100)}% 보유
                    </p>
                  </div>

                  {/* missing_ingredients: 부족한 재료 목록 표시 */}
                  {r.missing_ingredients?.length > 0 && (
                    <p style={{ fontSize: '0.76rem', color: 'black', margin: '4px 0 0' }}>
                      ⚠️ 부족: {r.missing_ingredients.join(', ')}
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
              <div style={{
                display: 'inline-block', background: '#fff3e0',
                color: '#000000', padding: '4px 12px',
                borderRadius: '20px', fontSize: '0.82rem',
                fontWeight: 700, marginBottom: '12px',
              }}>
                🔥 유통기한 임박 재료 활용 레시피
              </div>
            )}

            {/* 냉장고 재료 매칭률 게이지 바 */}
            <div style={{
              background: '#f8f5f0', borderRadius: '12px',
              padding: '12px 16px', marginBottom: '16px',
            }}>
              <div style={{ fontSize: '0.82rem', color: '#8a7a60', marginBottom: '6px' }}>
                냉장고 재료 매칭률
              </div>
              <div style={{
                height: '8px', background: '#e8e3db',
                borderRadius: '8px', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round(selectedRecipe.match_score * 100)}%`,
                  background: selectedRecipe.match_score >= 0.7 ? '#4CAF50' : '#fdd537',
                  borderRadius: '8px',
                }} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2a1f0e', marginTop: '6px' }}>
                {Math.round(selectedRecipe.match_score * 100)}% 보유
              </div>
            </div>

            {/* 레시피 설명 */}
            <div className="detail-section">
              <h3>💬 레시피 설명</h3>
              <p style={{ color: '#5a4a32', lineHeight: 1.6 }}>
                {selectedRecipe.description}
              </p>
            </div>

            {/* 필요 재료 전체 (보유: 초록, 부족: 노란) */}
            <div className="detail-section">
              <h3>📋 필요 재료</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedRecipe.ingredients?.map((ing, i) => {
                  // 부족한 재료는 노란 테두리, 보유 재료는 초록 테두리
                  const isMissing = selectedRecipe.missing_ingredients?.some(
                    missing => missing === ing || missing.includes(ing) || ing.includes(missing)
                  );
                  return (
                    <span
                      key={i}
                      style={{
                        padding: '4px 12px', borderRadius: '20px',
                        fontSize: '0.82rem', fontWeight: 600,
                        background: isMissing ? '#fff3e0' : '#e8f5e9',
                        color: '#000000',
                        border: `1px solid ${isMissing ? '#fdd537' : '#4CAF50'}`,
                      }}
                    >
                      {isMissing ? '❌ ' : '✅ '}{ing}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* 부족한 재료 강조 + 근처 시장에서 구매하기 버튼 */}
            {selectedRecipe.missing_ingredients?.length > 0 && (
              <div className="detail-section">
                <h3>🛒 부족한 재료</h3>
                <p className="missing-alert" style={{ color: '#5a4a32', lineHeight: 1.6 }}>
                  ⚠️ {selectedRecipe.missing_ingredients.join(', ')}
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

                    // 현재 위치 가져오기 (실패 시 서울 시청 좌표로 대체)
                    const getLocation = () => new Promise((resolve) => {
                      navigator.geolocation.getCurrentPosition(
                        pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                        () => resolve({ latitude: 37.5665, longitude: 126.9780 })
                      );
                    });

                    const location = await getLocation();

                    try {
                      const res = await fetch('/market/missing-items', {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({
                          missingIngredients: selectedRecipe.missing_ingredients,
                          latitude: location.latitude,
                          longitude: location.longitude
                        })
                      });
                      const json = await res.json();
                      setMapMarkets(json.data?.markets || []);
                    } catch (err) {
                      console.error('시장 검색 실패:', err);
                    } finally {
                      setMapLoading(false);
                      setShowMap(true);
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#fdd537',
                    color: '#2a1f0e',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  🏪 근처 시장에서 구매하기
                </button>
              </div>
            )}

            {/* 요리법 (cooking_steps: 배열 또는 문자열 모두 대응) */}
            <div className='detail-section'>
              <h3>🍳 요리법</h3>
              <ol style={{ paddingLeft: '20px', color: '#5a4a32', lineHeight: 2 }}>
                {Array.isArray(selectedRecipe.cooking_steps)
                  ? selectedRecipe.cooking_steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))
                  : <li>{selectedRecipe.cooking_steps}</li>
                }
              </ol>
            </div>

            {/* 소스/양념 만드는 법 (있을 경우만 표시) */}
            {selectedRecipe.sauce_steps?.length > 0 && (
              <div className='detail-section'>
                <h3>🥣 소스/양념 만드는 법</h3>
                <ol style={{ paddingLeft: '20px', color: '#5a4a32', lineHeight: 2 }}>
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
                  width: '100%',
                  padding: '14px',
                  background: '#fdd537',
                  color: '#2a1f0e',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '16px'
                }}
              >
                📖 레시피북에 저장
              </button>
            </div>

          </div>
        )}

      </div>


    </div>
  );
}