import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/user/RecipeRecommendPage.css';

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

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  const fetchRecommend = async () => {
    setLoading(true);
    setErrorMsg('');
    setRecipes([]);

    try {
      // ── 1단계: Spring에서 냉장고 재료 조회 ────────────────────
      // GET /user/fridge/items
      // → FridgeItemResponse: { id, name, status, exp, quantity, unit, ... }
      const fridgeRes = await fetch('/user/fridge/items', {
        headers: getAuthHeaders(),
      });

      if (!fridgeRes.ok) {
        if (fridgeRes.status === 401) {
          navigate('/user/login');
          return;
        }
        throw new Error('냉장고 재료를 불러오지 못했어요.');
      }

      const fridgeJson  = await fridgeRes.json();
      const fridgeItems = fridgeJson.data || [];

      if (fridgeItems.length === 0) {
        setErrorMsg('냉장고에 재료가 없어요. 먼저 재료를 추가해주세요!');
        setLoading(false);
        return;
      }

      // ✅ 전체 재료 이름 목록
      const ingredients = fridgeItems.map(i => i.name);

      // ✅ 유통기한 임박 재료 (status === 'NEAR_EXPIRY')
      // → Python이 이 재료들을 우선 사용하는 레시피를 상단에 배치
      const expiringIngredients = fridgeItems
        .filter(i => i.status === 'NEAR_EXPIRY')
        .map(i => i.name);

      // ── 2단계: Python 서버에 레시피 추천 요청 ──────────────────
      // POST /recipe/recommend (Vite proxy → Python :8000)
      // RecipeRecommendRequest: { ingredients, expiring_ingredients }
      const recipeRes = await fetch('/recipe/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ✅ Python 서버는 JWT 토큰 불필요 (인증 없음)
        body: JSON.stringify({
          ingredients,
          expiring_ingredients: expiringIngredients,
        }),
      });

      if (!recipeRes.ok) {
        throw new Error('레시피 추천 서버 오류. Python 서버가 실행 중인지 확인해주세요.');
      }

      // ✅ Python RecipeResponse: { recipes: RecipeItem[] }
      // RecipeItem: { title, description, ingredients[], missing_ingredients[],
      //               match_score(0~1), has_expiring(bool) }
      const recipeJson = await recipeRes.json();
      const recipeList = recipeJson.recipes || [];

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

  useEffect(() => {
    fetchRecommend();
  }, []);

  // ── 렌더링 ────────────────────────────────────────────────────

  return (
    <div className="rrp-page">
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
                  padding: '12px 24px', background: '#FF6B35',
                  color: '#fff', border: 'none', borderRadius: '12px',
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                다시 시도
              </button>
              <button
                onClick={() => navigate('/user/fridge')}
                style={{
                  padding: '12px 24px', background: 'transparent',
                  color: '#8a7a60', border: '1.5px solid #ddd',
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
                    {/* ✅ has_expiring: 유통기한 임박 재료 포함 레시피는 불 아이콘 */}
                    {r.has_expiring ? '🔥 ' : '🥗 '}
                    {r.title}
                  </strong>
                  <p className="rrp-card-desc">{r.description}</p>

                  {/* ✅ match_score: 0.0~1.0 → % 로 변환해서 표시 */}
                  <div style={{ marginTop: '6px' }}>
                    <div style={{
                      height: '4px', background: '#f0ede8',
                      borderRadius: '4px', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.round(r.match_score * 100)}%`,
                        background: r.match_score >= 0.7 ? '#4CAF50' : '#FF6B35',
                        borderRadius: '4px',
                      }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#8a7a60', margin: '3px 0 0' }}>
                      재료 {Math.round(r.match_score * 100)}% 보유
                    </p>
                  </div>

                  {/* ✅ missing_ingredients: 부족한 재료 표시 */}
                  {r.missing_ingredients?.length > 0 && (
                    <p style={{ fontSize: '0.76rem', color: '#FF6B35', margin: '4px 0 0' }}>
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
            <button
              className="rrp-back-btn"
              onClick={() => setSelectedRecipe(null)}
            >
              ← 목록으로
            </button>

            <h2 className="detail-title">{selectedRecipe.title}</h2>

            {/* ✅ 유통기한 임박 재료 포함 배지 */}
            {selectedRecipe.has_expiring && (
              <div style={{
                display: 'inline-block', background: '#fff3e0',
                color: '#FF6B35', padding: '4px 12px',
                borderRadius: '20px', fontSize: '0.82rem',
                fontWeight: 700, marginBottom: '12px',
              }}>
                🔥 유통기한 임박 재료 활용 레시피
              </div>
            )}

            {/* ✅ 매칭 점수 */}
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
                  background: selectedRecipe.match_score >= 0.7 ? '#4CAF50' : '#FF6B35',
                  borderRadius: '8px',
                }} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2a1f0e', marginTop: '6px' }}>
                {Math.round(selectedRecipe.match_score * 100)}% 보유
              </div>
            </div>

            {/* ✅ 설명 */}
            <div className="detail-section">
              <h3>💬 레시피 설명</h3>
              <p style={{ color: '#5a4a32', lineHeight: 1.6 }}>
                {selectedRecipe.description}
              </p>
            </div>

            {/* ✅ 필요 재료 전체 */}
            <div className="detail-section">
              <h3>📋 필요 재료</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedRecipe.ingredients?.map((ing, i) => {
                  // ✅ 부족한 재료는 빨간색, 보유 재료는 초록색
                  const isMissing = selectedRecipe.missing_ingredients?.includes(ing);
                  return (
                    <span
                      key={i}
                      style={{
                        padding: '4px 12px', borderRadius: '20px',
                        fontSize: '0.82rem', fontWeight: 600,
                        background: isMissing ? '#fff3e0' : '#e8f5e9',
                        color:      isMissing ? '#FF6B35' : '#4CAF50',
                        border: `1px solid ${isMissing ? '#FF6B35' : '#4CAF50'}`,
                      }}
                    >
                      {isMissing ? '❌ ' : '✅ '}{ing}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* ✅ 부족한 재료 강조 */}
            {selectedRecipe.missing_ingredients?.length > 0 && (
              <div className="detail-section">
                <h3>🛒 부족한 재료</h3>
                <p className="missing-alert">
                  ⚠️ {selectedRecipe.missing_ingredients.join(', ')}
                </p>
                <p style={{ fontSize: '0.82rem', color: '#8a7a60', marginTop: '4px' }}>
                  근처 시장에서 구매할 수 있어요!
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}