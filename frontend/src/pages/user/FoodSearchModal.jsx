import React, { useState, useEffect } from 'react';
import '../../Styles/common/RecipeRecommendModal.css';
import '../../Styles/common/FoodSearchModal.css';

/* ══════════════════════════════════════════════════════════
   할인 상태 계산
   ✅ [수정] 백엔드 saleStatus 기준으로 변경
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
  // ✅ [수정] 백엔드 MarketItemResponse 필드 사용
  const marketItem = marketItems?.find(m =>
    m.name?.includes(ingName) || ingName?.includes(m.name)
  );
  const status    = getSaleStatus(marketItem);
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
          <span className="market-name-text">🏪 {marketItem.marketName}</span>
          <div className="market-price-row">
            {status === SALE_STATUS.ON_SALE && (
              <>
                <span className="price-original">{marketItem.originalPrice?.toLocaleString()}원</span>
                <span className="price-sale">{salePrice?.toLocaleString()}원</span>
                <span className="discount-rate-badge">-{marketItem.discountRate}%</span>
              </>
            )}
            {status === SALE_STATUS.UPCOMING && (
              <>
                <span className="price-normal">{marketItem.originalPrice?.toLocaleString()}원</span>
                <span className="upcoming-rate-badge">
                  {marketItem.startTime?.slice(11, 16)}부터 {marketItem.discountRate}% 할인
                </span>
              </>
            )}
            {status === SALE_STATUS.NONE && (
              <span className="price-normal">{marketItem.originalPrice?.toLocaleString()}원</span>
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
   검색 결과 상세 화면
══════════════════════════════════════════════════════════ */
const FoodResultDetail = ({ result, marketItems, onAddToCart, onSave, onBack }) => {
  const { recipe, have, missing } = result;
  const [saveState, setSaveState] = useState('idle');

  const handleSave = async () => {
    if (saveState !== 'idle') return;
    setSaveState('saving');
    await onSave(recipe);
    setSaveState('saved');
  };

  return (
    <div className="recipe-detail-view">
      <button className="recipe-detail-back" onClick={onBack}>← 다시 검색</button>

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

      {have?.length > 0 && (
        <div className="recipe-detail-section">
          <div className="recipe-section-title have-title">✅ 냉장고에 있는 재료</div>
          <div className="recipe-tag-row">
            {have.map(ing => <span key={ing} className="recipe-tag recipe-tag--have">{ing}</span>)}
          </div>
        </div>
      )}

      {missing?.length > 0 && (
        <div className="recipe-detail-section">
          <div className="recipe-section-title missing-title">🛒 없는 재료 — 시장에서 구매</div>
          <div className="missing-legend">
            <span className="legend-dot legend-dot--on-sale" /><span>할인 중</span>
            <span className="legend-dot legend-dot--upcoming" /><span>할인 예정</span>
            <span className="legend-dot legend-dot--none" /><span>일반</span>
          </div>
          <div className="missing-ing-list">
            {missing.map(ing => (
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

      {recipe.ingredients?.length > 0 && (
        <div className="recipe-detail-section">
          <div className="recipe-section-title">📋 필요 재료 전체</div>
          <div className="recipe-tag-row">
            {recipe.ingredients.map(ing => (
              <span key={ing} className="recipe-tag recipe-tag--ingredient">{ing}</span>
            ))}
          </div>
        </div>
      )}

      {recipe.steps?.length > 0 && (
        <div className="recipe-detail-section">
          <div className="recipe-section-title">🍳 조리 순서</div>
          <div className="recipe-steps-list">
            {recipe.steps.map((step, i) => (
              <div key={i} className="recipe-step-item">
                <div className="recipe-step-num">{i + 1}</div>
                <span className="recipe-step-text">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   메인 — 먹고 싶은 음식 찾기 모달
══════════════════════════════════════════════════════════ */
const FoodSearchModal = ({ myIngredients, onClose }) => {
  const [query,       setQuery]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState(null);
  const [marketItems, setMarketItems] = useState([]);
  const [toast,       setToast]       = useState('');
  const [history,     setHistory]     = useState([]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  // ✅ [수정] localStorage → 위치 기반 시장 품목 API 조회
  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('foodSearchHistory') || '[]');
    setHistory(h);

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
            setMarketItems(
              markets.flatMap(m =>
                (m.items || []).map(item => ({ ...item, marketName: m.name }))
              )
            );
          },
          () => {
            // 위치 거부 시 localStorage 폴백
            setMarketItems(JSON.parse(localStorage.getItem('marketItems') || '[]'));
          }
        );
      } catch {
        setMarketItems(JSON.parse(localStorage.getItem('marketItems') || '[]'));
      }
    };
    fetchMarketItems();
  }, []);

  // ✅ [수정] 음식 검색 → 백엔드 API 연동
  // 백엔드: GET /user/recipe/search?keyword={query} (RecipeRepository.findByKeyword)
  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('foodSearchHistory', JSON.stringify(newHistory));

    try {
      const response = await fetch(
        `/user/recipe/search?keyword=${encodeURIComponent(query)}`,
        { headers: getAuthHeaders() }
      );
      const resData = await response.json();

      if (response.ok && resData.data) {
        // ✅ RecipeResponse 구조:
        // { id, title, content, imageUrl, writerName, recipeItems: [{ name, ... }] }
        const recipe = resData.data;

        // ✅ 냉장고 재료와 비교
        const myIngredientNames = (myIngredients || []).map(i => i.name);
        const recipeIngNames    = recipe.recipeItems?.map(ri => ri.name) || [];

        const have    = recipeIngNames.filter(rn =>
          myIngredientNames.some(mn => mn.includes(rn) || rn.includes(mn))
        );
        const missing = recipeIngNames.filter(rn =>
          !myIngredientNames.some(mn => mn.includes(rn) || rn.includes(mn))
        );

        setResult({
          recipe: {
            id:          recipe.id,
            emoji:       '🍽',
            name:        recipe.title,
            time:        '조리 시간 참고',
            difficulty:  '보통',
            ingredients: recipeIngNames,
            steps:       recipe.content ? [recipe.content] : [],
          },
          have,
          missing,
        });

      } else {
        // ✅ API 미연동 시 목 데이터로 폴백
        await mockSearch(query);
      }
    } catch {
      await mockSearch(query);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 목 데이터 폴백 (백엔드 연동 전 임시)
  const mockSearch = async (q) => {
    await new Promise(r => setTimeout(r, 800));
    const myIngredientNames = (myIngredients || []).map(i => i.name);

    const FOOD_DB = {
      '파스타':   { ingredients: ['파스타', '올리브오일', '마늘', '베이컨', '파마산치즈', '소금', '후추'],
                   steps: ['소금물에 파스타를 삶습니다.', '마늘을 볶습니다.', '버무려 완성합니다.'] },
      '된장찌개': { ingredients: ['된장', '두부', '애호박', '양파', '멸치육수', '청양고추'],
                   steps: ['멸치육수를 끓입니다.', '된장을 풀어 넣습니다.', '채소를 넣고 완성합니다.'] },
    };

    const found = Object.entries(FOOD_DB).find(([key]) =>
      q.includes(key) || key.includes(q)
    );
    const foodData = found ? found[1] : {
      ingredients: [`${q} 재료1`, `${q} 재료2`, '소금', '후추'],
      steps: ['재료를 손질합니다.', '볶아줍니다.', '간을 맞춰 완성합니다.'],
    };

    const have    = foodData.ingredients.filter(ing =>
      myIngredientNames.some(mn => mn.includes(ing) || ing.includes(mn))
    );
    const missing = foodData.ingredients.filter(ing =>
      !myIngredientNames.some(mn => mn.includes(ing) || ing.includes(mn))
    );

    setResult({
      recipe: { id: Date.now(), emoji: '🍽', name: q, time: '30분', difficulty: '보통',
                ingredients: foodData.ingredients, steps: foodData.steps },
      have, missing,
    });
  };

  // ✅ [수정] 레시피 저장 → POST /user/recipe-book?recipeId={id}
  const handleSaveRecipe = async (recipe) => {
    try {
      if (recipe.id) {
        await fetch(`/user/recipe-book?recipeId=${recipe.id}`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
      }
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
        <div className="rr-header" style={{ borderLeft: '4px solid #fdd537' }}>
          {result ? (
            <button className="rr-back-btn" style={{ color: '#2a1f0e' }} onClick={() => setResult(null)}>
              ← 다시 검색
            </button>
          ) : (
            <span className="rr-header-title">🍽 먹고 싶은 음식 찾기</span>
          )}
          <button className="rr-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="rr-body">
          {!result && (
            <div className="fs-search-view">
              <div className="fs-search-wrap">
                <input
                  className="fs-search-inp"
                  type="text"
                  placeholder="먹고 싶은 음식을 입력하세요 (예: 파스타, 된장찌개...)"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  autoFocus
                />
                <button
                  className="fs-search-btn"
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                >
                  {loading ? '...' : '검색'}
                </button>
              </div>

              {loading && (
                <div className="rr-loading">
                  <div className="rr-spinner" style={{ borderTopColor: '#FF6B35' }} />
                  <p>"{query}" 레시피를 분석하는 중...</p>
                </div>
              )}

              {!loading && history.length > 0 && (
                <div className="fs-history-wrap">
                  <div className="fs-history-title">🕐 최근 검색</div>
                  <div className="fs-history-list">
                    {history.map((h, i) => (
                      <button key={i} className="fs-history-chip" onClick={() => setQuery(h)}>{h}</button>
                    ))}
                    <button className="fs-history-clear" onClick={() => {
                      setHistory([]);
                      localStorage.removeItem('foodSearchHistory');
                    }}>전체 삭제</button>
                  </div>
                </div>
              )}

              {!loading && (
                <div className="fs-suggest-wrap">
                  <div className="fs-suggest-title">💡 이런 음식은 어때요?</div>
                  <div className="fs-suggest-grid">
                    {['파스타', '된장찌개', '볶음밥', '비빔밥', '라면', '김치찌개', '카레', '샐러드'].map(food => (
                      <button key={food} className="fs-suggest-chip" onClick={() => setQuery(food)}>
                        {food}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {result && !loading && (
            <FoodResultDetail
              result={result}
              marketItems={marketItems}
              onAddToCart={handleAddToCart}
              onSave={handleSaveRecipe}
              onBack={() => setResult(null)}
            />
          )}
        </div>

        {toast && <div className="rr-toast">{toast}</div>}
      </div>
    </div>
  );
};

export default FoodSearchModal;