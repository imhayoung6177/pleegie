import React, { useState, useEffect } from 'react';
import '../../Styles/common/RecipeRecommendModal.css';

/* ══════════════════════════════════════════════════════════
   할인 상태 계산
   ✅ [수정] 백엔드 saleStatus 기준으로 변경
   이전: saleStart/saleEnd 시간 문자열로 직접 계산
   이후: MarketItemResponse.saleStatus "NONE"|"UPCOMING"|"ON_SALE"
══════════════════════════════════════════════════════════ */
const SALE_STATUS = { NONE: 'NONE', UPCOMING: 'UPCOMING', ON_SALE: 'ON_SALE' };

const getSaleStatus = (item) => {
  if (!item) return SALE_STATUS.NONE;
  if (item.saleStatus === 'ON_SALE')  return SALE_STATUS.ON_SALE;
  if (item.saleStatus === 'UPCOMING') return SALE_STATUS.UPCOMING;
  return SALE_STATUS.NONE;
};

/* ══════════════════════════════════════════════════════════
   없는 재료 카드
══════════════════════════════════════════════════════════ */
const MissingIngredientCard = ({ ingName, marketItems, onAddToCart }) => {
  // ✅ [수정] 백엔드 MarketItemResponse 필드명에 맞게 수정
  // 이전: marketItem.price, marketItem.discountRate (localStorage 구조)
  // 이후: marketItem.originalPrice, marketItem.discountRate (DB 구조)
  const marketItem = marketItems?.find(m =>
    m.name?.includes(ingName) || ingName?.includes(m.name)
  );

  const status   = getSaleStatus(marketItem);
  const salePrice = marketItem?.discountPrice || null;

  return (
    <div className={`missing-card missing-card--${status.toLowerCase()}`}>
      <div className="missing-card-top">
        <span className="missing-card-name">{ingName}</span>
        {status === SALE_STATUS.ON_SALE  && <span className="sale-badge sale-badge--on-sale">🔴 할인 중</span>}
        {status === SALE_STATUS.UPCOMING && <span className="sale-badge sale-badge--upcoming">⏰ 할인 예정</span>}
        {!marketItem && <span className="sale-badge sale-badge--none">미등록</span>}
      </div>

      {marketItem && (
        <div className="missing-card-market">
          {/* ✅ [수정] shopName → marketName (MarketItemResponse 필드) */}
          <span className="market-name-text">🏪 {marketItem.marketName}</span>
          <div className="market-price-row">
            {status === SALE_STATUS.ON_SALE && (
              <>
                <span className="price-original">
                  {marketItem.originalPrice?.toLocaleString()}원
                </span>
                <span className="price-sale">
                  {salePrice?.toLocaleString()}원
                </span>
                <span className="discount-rate-badge">
                  -{marketItem.discountRate}%
                </span>
              </>
            )}
            {status === SALE_STATUS.UPCOMING && (
              <>
                <span className="price-normal">
                  {marketItem.originalPrice?.toLocaleString()}원
                </span>
                {/* ✅ [수정] startTime에서 시간 부분만 추출 */}
                <span className="upcoming-rate-badge">
                  {marketItem.startTime?.slice(11, 16)}부터 {marketItem.discountRate}% 할인
                </span>
              </>
            )}
            {status === SALE_STATUS.NONE && (
              <span className="price-normal">
                {marketItem.originalPrice?.toLocaleString()}원
              </span>
            )}
          </div>
        </div>
      )}

      {marketItem ? (
        <button
          className={`missing-buy-btn missing-buy-btn--${status.toLowerCase()}`}
          onClick={() => onAddToCart(ingName, marketItem, status)}
        >
          {status === SALE_STATUS.ON_SALE  && `🔴 지금 바로 구매하기 (${marketItem.discountRate}% 할인)`}
          {status === SALE_STATUS.UPCOMING && `⏰ 장바구니에 담기 (곧 할인 시작)`}
          {status === SALE_STATUS.NONE     && `🛒 장바구니에 담기`}
        </button>
      ) : (
        <div className="missing-no-market">근처 시장에 아직 등록된 상품이 없어요</div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   레시피 리스트 카드
══════════════════════════════════════════════════════════ */
const RecipeListCard = ({ recipe, marketItems, onClick }) => {
  const saleFlags = recipe.missing?.map(name => {
    const m = marketItems?.find(mi =>
      mi.name?.includes(name) || name?.includes(mi.name)
    );
    return getSaleStatus(m);
  }) || [];

  const hasOnSale   = saleFlags.includes(SALE_STATUS.ON_SALE);
  const hasUpcoming = saleFlags.includes(SALE_STATUS.UPCOMING);

  return (
    <div className="recipe-list-card" onClick={onClick}>
      <div className="recipe-card-top">
        <span className="recipe-card-emoji">{recipe.emoji || '🍽'}</span>
        <div className="recipe-card-info">
          <strong className="recipe-card-name">{recipe.name}</strong>
          <span className="recipe-card-meta">
            ⏱ {recipe.time} · 난이도: {recipe.difficulty}
          </span>
        </div>
        {hasOnSale   && <span className="sale-badge sale-badge--on-sale">🔴 할인 중</span>}
        {!hasOnSale && hasUpcoming && <span className="sale-badge sale-badge--upcoming">⏰ 할인 예정</span>}
      </div>

      <div className="recipe-card-tags">
        {recipe.matched?.map(m => (
          <span key={m} className="recipe-tag recipe-tag--have">{m}</span>
        ))}
        {recipe.missing?.map(m => (
          <span key={m} className="recipe-tag recipe-tag--missing">+{m}</span>
        ))}
      </div>

      {recipe.matchRate != null && (
        <div className="recipe-card-match">
          <div className="match-bar-wrap">
            <div className="match-bar-fill" style={{ width: `${recipe.matchRate}%` }} />
          </div>
          <span className="match-rate-text">재료 {recipe.matchRate}% 보유</span>
        </div>
      )}
      <span className="recipe-card-arrow">›</span>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   레시피 상세
══════════════════════════════════════════════════════════ */
const RecipeDetail = ({ recipe, marketItems, onBack, onAddToCart, onSave }) => {
  const [saveState, setSaveState] = useState('idle');

  // ✅ [수정] 저장 여부를 API로 확인 (추후 연동)
  // 현재는 localStorage 폴백 유지
  useEffect(() => {
    const savedList = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    if (savedList.some(r => r.id === recipe.id)) {
      setSaveState('saved');
    }
  }, [recipe.id]);

  const handleSave = async () => {
    if (saveState !== 'idle') return;
    setSaveState('saving');
    await onSave(recipe);
    setSaveState('saved');
  };

  return (
    <div className="recipe-detail-view">
      <button className="recipe-detail-back" onClick={onBack}>← 레시피 목록</button>

      <div className="recipe-detail-header">
        <span className="recipe-detail-emoji">{recipe.emoji || '🍽'}</span>
        <div className="recipe-detail-title-wrap">
          <h2 className="recipe-detail-title">{recipe.name}</h2>
          <p className="recipe-detail-meta">⏱ {recipe.time} · 난이도: {recipe.difficulty}</p>
        </div>
      </div>

      <button
        className={`recipe-save-btn recipe-save-btn--${saveState}`}
        onClick={handleSave}
        disabled={saveState !== 'idle'}
      >
        <span className="save-btn-icon">
          {saveState === 'idle'   && '📖'}
          {saveState === 'saving' && '⏳'}
          {saveState === 'saved'  && '✅'}
        </span>
        <span className="save-btn-text">
          {saveState === 'idle'   && '레시피북에 저장하기'}
          {saveState === 'saving' && '저장 중...'}
          {saveState === 'saved'  && '저장 완료!'}
        </span>
      </button>

      {recipe.matched?.length > 0 && (
        <div className="recipe-detail-section">
          <div className="recipe-section-title have-title">✅ 보유 중인 재료</div>
          <div className="recipe-tag-row">
            {recipe.matched.map(ing => (
              <span key={ing} className="recipe-tag recipe-tag--have">{ing}</span>
            ))}
          </div>
        </div>
      )}

      {recipe.missing?.length > 0 && (
        <div className="recipe-detail-section">
          <div className="recipe-section-title missing-title">🛒 없는 재료</div>
          <div className="missing-legend">
            <span className="legend-dot legend-dot--on-sale" /><span>할인 중</span>
            <span className="legend-dot legend-dot--upcoming" /><span>할인 예정</span>
            <span className="legend-dot legend-dot--none" /><span>일반</span>
          </div>
          <div className="missing-ing-list">
            {recipe.missing.map(ing => (
              <MissingIngredientCard
                key={ing}
                ingName={ing}
                marketItems={marketItems}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      )}

      <div className="recipe-detail-section">
        <div className="recipe-section-title">📋 필요 재료</div>
        <div className="recipe-tag-row">
          {recipe.ingredients?.map(ing => (
            <span key={ing} className="recipe-tag recipe-tag--ingredient">{ing}</span>
          ))}
        </div>
      </div>

      <div className="recipe-detail-section">
        <div className="recipe-section-title">🍳 조리 순서</div>
        <div className="recipe-steps-list">
          {recipe.steps?.map((step, i) => (
            <div key={i} className="recipe-step-item">
              <div className="recipe-step-num">{i + 1}</div>
              <span className="recipe-step-text">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   메인 모달
══════════════════════════════════════════════════════════ */
const RecipeRecommendModal = ({ myIngredients, onClose }) => {
  const [loading,        setLoading]        = useState(true);
  const [recipes,        setRecipes]        = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [marketItems,    setMarketItems]    = useState([]);
  const [toast,          setToast]          = useState('');

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  // ✅ [수정] localStorage → GET /market?lat&lng 로 가까운 시장 품목 조회
  useEffect(() => {
    const fetchMarketItems = async () => {
      try {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `/market?latitude=${latitude}&longitude=${longitude}`,
              { headers: getAuthHeaders() }
            );
            const json = await res.json();
            const markets = json.data || [];

            // ✅ 가까운 시장들의 품목을 모두 가져옴
            // 백엔드: GET /market/items → 현재 로그인한 상인 품목만 반환
            // 사용자 입장에서는 주변 시장 품목이 필요하므로 markets 데이터 활용
            // 추후 별도 API 연동 예정, 현재는 markets 정보만 사용
            setMarketItems(markets.flatMap(m => 
              // market 응답에 items가 있으면 사용, 없으면 빈 배열
              (m.items || []).map(item => ({
                ...item,
                marketName: m.name,
              }))
            ));
          },
          () => {
            // ✅ 위치 거부 시 localStorage 폴백
            const saved = JSON.parse(localStorage.getItem('marketItems') || '[]');
            setMarketItems(saved);
          }
        );
      } catch {
        const saved = JSON.parse(localStorage.getItem('marketItems') || '[]');
        setMarketItems(saved);
      }
    };
    fetchMarketItems();
  }, []);

  // ✅ [수정] 목 데이터 → API 연동
  // myIngredients는 FridgePage에서 props로 전달받음
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        if (!myIngredients || myIngredients.length === 0) {
          setRecipes([]);
          setLoading(false);
          return;
        }

        const ingredientList = myIngredients.map(i => i.name);
        const expiringList   = myIngredients
          .filter(i => i.status === 'NEAR_EXPIRY')
          .map(i => i.name);

        const response = await fetch('/user/recipe/recommend', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            ingredients:          ingredientList,
            expiring_ingredients: expiringList,
          }),
        });

        const resData = await response.json();
        if (response.ok && resData.success) {
          const finalData =
            resData.data?.recipes ||
            (Array.isArray(resData.data) ? resData.data : []);
          setRecipes(finalData);
        } else {
          // ✅ API 실패 시 목 데이터로 폴백 (개발 중 편의)
          setRecipes([
            {
              id: 101, emoji: '🍳', name: '계란볶음밥',
              time: '15분', difficulty: '쉬움', matchRate: 95,
              matched: ['계란', '쌀', '간장'],
              missing: ['햄', '시금치'],
              ingredients: ['계란 2개', '밥 1공기', '간장 1큰술', '파 약간', '참기름'],
              steps: ['파를 잘게 썹니다.', '계란을 스크램블합니다.', '밥을 넣고 볶아줍니다.'],
            },
          ]);
        }
      } catch {
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [myIngredients]);

  // ✅ [수정] 레시피 저장 → POST /user/recipe-book?recipeId={id}
  const handleSaveRecipe = async (recipe) => {
    try {
      if (recipe.id) {
        await fetch(`/user/recipe-book?recipeId=${recipe.id}`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
      }
      // ✅ localStorage에도 백업 (오프라인 대비)
      const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      if (!saved.some(r => r.id === recipe.id)) {
        saved.push(recipe);
        localStorage.setItem('savedRecipes', JSON.stringify(saved));
      }
      showToast(`'${recipe.name}' 레시피를 레시피북에 저장했어요! 📖`);
    } catch {
      showToast('저장에 실패했습니다.');
    }
  };

  const handleAddToCart = (ingName, marketItem, status) => {
    const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    if (cart.some(item => item.name === ingName)) {
      showToast(`'${ingName}'은(는) 이미 장바구니에 있어요!`);
      return;
    }
    // ✅ [수정] 백엔드 MarketItemResponse 필드명 사용
    const finalPrice = status === SALE_STATUS.ON_SALE
      ? marketItem.discountPrice
      : marketItem.originalPrice;

    cart.push({
      id:    Date.now() + Math.random(),
      name:  ingName,
      price: finalPrice,
      emoji: '🛒',
      desc:  `${marketItem.marketName} · ${status === SALE_STATUS.ON_SALE ? `${marketItem.discountRate}% 할인가` : '정상가'}`,
    });
    localStorage.setItem('cartItems', JSON.stringify(cart));
    showToast(`'${ingName}'을(를) 장바구니에 담았어요! 🛒`);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div className="rr-overlay" onClick={onClose}>
      <div className="rr-modal" onClick={e => e.stopPropagation()}>
        <div className="rr-header">
          {selectedRecipe ? (
            <button className="rr-back-btn" onClick={() => setSelectedRecipe(null)}>← 목록</button>
          ) : (
            <span className="rr-header-title">🍽 AI 레시피 추천</span>
          )}
          <button className="rr-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="rr-body">
          {loading && (
            <div className="rr-loading">
              <div className="rr-spinner" />
              <p>냉장고 재료로 레시피를 찾는 중...</p>
            </div>
          )}

          {!loading && !selectedRecipe && (
            <div className="rr-list">
              <p className="rr-list-desc">보유 재료 기준으로 만들 수 있는 레시피예요</p>
              {recipes.length > 0 ? (
                recipes.map(recipe => (
                  <RecipeListCard
                    key={recipe.id}
                    recipe={recipe}
                    marketItems={marketItems}
                    onClick={() => setSelectedRecipe(recipe)}
                  />
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8a7a60' }}>
                  <div style={{ fontSize: '2rem' }}>🥲</div>
                  <p>추천 레시피를 찾지 못했어요<br />냉장고 재료를 더 추가해보세요!</p>
                </div>
              )}
            </div>
          )}

          {!loading && selectedRecipe && (
            <RecipeDetail
              recipe={selectedRecipe}
              marketItems={marketItems}
              onBack={() => setSelectedRecipe(null)}
              onAddToCart={handleAddToCart}
              onSave={handleSaveRecipe}
            />
          )}
        </div>

        {toast && <div className="rr-toast">{toast}</div>}
      </div>
    </div>
  );
};

export default RecipeRecommendModal;