import React, { useState, useEffect } from 'react';
import '../../Styles/common/RecipeRecommendModal.css';
import '../../Styles/common/FoodSearchModal.css';

/* ══════════════════════════════════════════════════════════
   할인 상태 계산 (RecipeRecommendModal과 동일한 로직)
══════════════════════════════════════════════════════════ */
const SALE_STATUS = { NONE: 'NONE', UPCOMING: 'UPCOMING', ON_SALE: 'ON_SALE' };

const getSaleStatus = (item, now) => {
  if (!item?.saleStart || !item?.saleEnd || !item?.discountRate) return SALE_STATUS.NONE;
  const [sh, sm] = item.saleStart.split(':').map(Number);
  const [eh, em] = item.saleEnd.split(':').map(Number);
  const start = new Date(now); start.setHours(sh, sm, 0, 0);
  const end   = new Date(now); end.setHours(eh, em, 0, 0);
  const soon  = new Date(start.getTime() - 60 * 60 * 1000);
  if (now >= start && now < end)   return SALE_STATUS.ON_SALE;
  if (now >= soon  && now < start) return SALE_STATUS.UPCOMING;
  return SALE_STATUS.NONE;
};

/* ══════════════════════════════════════════════════════════
   없는 재료 카드 (RecipeRecommendModal과 동일한 UI)
══════════════════════════════════════════════════════════ */
const MissingIngredientCard = ({ ingName, marketItems, onAddToCart }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const marketItem = marketItems?.find(m =>
    m.name.includes(ingName) || ingName.includes(m.name)
  );
  const status = getSaleStatus(marketItem, now);
  const salePrice = marketItem && status === SALE_STATUS.ON_SALE
    ? Math.round(marketItem.price * (1 - marketItem.discountRate / 100))
    : null;

  return (
    <div className={`missing-card missing-card--${status.toLowerCase()}`}>
      <div className="missing-card-top">
        <span className="missing-card-name">{ingName}</span>
        {status === SALE_STATUS.ON_SALE && (
          <span className="sale-badge sale-badge--on-sale">🔴 할인 중</span>
        )}
        {status === SALE_STATUS.UPCOMING && (
          <span className="sale-badge sale-badge--upcoming">⏰ 할인 예정</span>
        )}
        {!marketItem && (
          <span className="sale-badge sale-badge--none">미등록</span>
        )}
      </div>

      {marketItem && (
        <div className="missing-card-market">
          <span className="market-name-text">🏪 {marketItem.shopName}</span>
          <div className="market-price-row">
            {status === SALE_STATUS.ON_SALE && (
              <>
                <span className="price-original">{marketItem.price.toLocaleString()}원</span>
                <span className="price-sale">{salePrice.toLocaleString()}원/{marketItem.unit}</span>
                <span className="discount-rate-badge">-{marketItem.discountRate}%</span>
              </>
            )}
            {status === SALE_STATUS.UPCOMING && (
              <>
                <span className="price-normal">{marketItem.price.toLocaleString()}원/{marketItem.unit}</span>
                <span className="upcoming-rate-badge">{marketItem.saleStart}부터 {marketItem.discountRate}% 할인</span>
              </>
            )}
            {status === SALE_STATUS.NONE && (
              <span className="price-normal">{marketItem.price.toLocaleString()}원/{marketItem.unit}</span>
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
   검색 결과 — 레시피 상세 화면
══════════════════════════════════════════════════════════ */
const FoodResultDetail = ({ result, marketItems, myIngredients, onAddToCart, onSave, onBack }) => {
  const { recipe, have, missing } = result;

  const [saveState, setSaveState] = useState(() => {
    const savedList = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    return savedList.some(r => r.id === recipe.id) ? 'saved' : 'idle';
  });

  const handleSave = async () => {
    if (saveState !== 'idle') return;
    setSaveState('saving');
    await new Promise(r => setTimeout(r, 600));
    onSave(recipe);
    setSaveState('saved');
  };

  return (
    <div className="recipe-detail-view">

      {/* 뒤로가기 */}
      <button className="recipe-detail-back" onClick={onBack}>
        ← 다시 검색
      </button>

      {/* 헤더 */}
      <div className="recipe-detail-header">
        <span className="recipe-detail-emoji">{recipe.emoji}</span>
        <div className="recipe-detail-title-wrap">
          <h2 className="recipe-detail-title">{recipe.name}</h2>
          <p className="recipe-detail-meta">
            ⏱ {recipe.time} &nbsp;·&nbsp; 난이도: {recipe.difficulty}
          </p>
        </div>
      </div>

      {/* ✅ 저장 버튼 */}
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

      {/* 보유 재료 */}
      {have?.length > 0 && (
        <div className="recipe-detail-section">
          <div className="recipe-section-title have-title">✅ 냉장고에 있는 재료</div>
          <div className="recipe-tag-row">
            {have.map(ing => (
              <span key={ing} className="recipe-tag recipe-tag--have">{ing}</span>
            ))}
          </div>
        </div>
      )}

      {/* 없는 재료 + 시장 연동 */}
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

      {/* 필요 재료 전체 */}
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

      {/* 조리 순서 */}
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

      {/* 주변 시장 */}
      {result.markets?.length > 0 && (
        <div className="recipe-detail-section">
          <div className="recipe-section-title" style={{ color: '#FF6B35' }}>
            🏪 재료를 파는 주변 시장
          </div>
          <div className="fs-market-list">
            {result.markets.map((m, i) => (
              <div key={i} className="fs-market-card">
                <div className="fs-market-top">
                  <strong className="fs-market-name">{m.name}</strong>
                  <span className="fs-market-dist">{m.distance}</span>
                </div>
                <span className="fs-market-spec">{m.specialty}</span>
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
  const [result,      setResult]      = useState(null);   // 검색 결과
  const [marketItems, setMarketItems] = useState([]);
  const [toast,       setToast]       = useState('');
  const [history,     setHistory]     = useState([]);     // 최근 검색어

  // ShopPage에서 저장한 시장 데이터 읽기
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('marketItems') || '[]');
    setMarketItems(saved);
    // 최근 검색어 로드
    const h = JSON.parse(localStorage.getItem('foodSearchHistory') || '[]');
    setHistory(h);
  }, []);

  /* ──────────────────────────────────────────
     음식 검색 핸들러
     현재: 목 데이터
     나중에: POST /api/food/search 로 교체
  ────────────────────────────────────────── */
  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    // 최근 검색어 저장 (최대 5개)
    const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('foodSearchHistory', JSON.stringify(newHistory));

    try {
      // ✅ [백엔드 연동 포인트]
      // const ingredientNames = myIngredients.map(i => i.name).join(',');
      // const res = await fetch(`/api/food/search?food=${query}&ingredients=${ingredientNames}`);
      // const data = await res.json();
      // setResult(data);

      // 현재: 목 데이터 (음식명에 따라 다른 결과 반환)
      await new Promise(r => setTimeout(r, 1400));

      const myIngredientNames = myIngredients.map(i => i.name);

      // 음식별 레시피 데이터
      const FOOD_DB = {
        '파스타': {
          recipe: {
            id: 201, emoji: '🍝', name: `${query}`,
            time: '25분', difficulty: '보통',
            ingredients: ['파스타 200g', '올리브오일 3큰술', '마늘 3쪽', '베이컨 100g', '파마산치즈', '소금', '후추'],
            steps: [
              '소금물에 파스타를 8~10분간 삶습니다.',
              '팬에 올리브오일을 두르고 마늘을 볶습니다.',
              '베이컨을 넣고 함께 볶아줍니다.',
              '삶은 파스타를 넣고 버무립니다.',
              '파마산치즈를 뿌리고 후추로 마무리합니다.',
            ],
          },
          allIngredients: ['파스타', '올리브오일', '마늘', '베이컨', '파마산치즈', '소금', '후추'],
        },
        '된장찌개': {
          recipe: {
            id: 202, emoji: '🥘', name: `${query}`,
            time: '20분', difficulty: '쉬움',
            ingredients: ['된장 2큰술', '두부 1/2모', '애호박 1/4개', '양파 1/4개', '멸치육수 2컵', '청양고추'],
            steps: [
              '멸치육수를 냄비에 넣고 끓입니다.',
              '된장을 풀어 넣습니다.',
              '두부, 애호박, 양파를 넣고 10분 끓입니다.',
              '청양고추를 넣어 완성합니다.',
            ],
          },
          allIngredients: ['된장', '두부', '애호박', '양파', '멸치육수', '청양고추'],
        },
      };

      // 검색어로 레시피 찾기 (없으면 기본 생성)
      const found = Object.entries(FOOD_DB).find(([key]) =>
        query.includes(key) || key.includes(query)
      );

      const foodData = found ? found[1] : {
        recipe: {
          id: Date.now(),
          emoji: '🍽',
          name: query,
          time: '30분',
          difficulty: '보통',
          ingredients: [`${query} 재료 1`, `${query} 재료 2`, '소금', '후추'],
          steps: [
            '재료를 손질합니다.',
            '팬을 달구고 재료를 볶습니다.',
            '간을 맞추고 완성합니다.',
          ],
        },
        allIngredients: [`${query} 재료 1`, `${query} 재료 2`, '소금', '후추'],
      };

      // 보유/없는 재료 분류
      const have    = foodData.allIngredients.filter(ing =>
        myIngredientNames.some(my => my.includes(ing) || ing.includes(my))
      );
      const missing = foodData.allIngredients.filter(ing =>
        !myIngredientNames.some(my => my.includes(ing) || ing.includes(my))
      );

      // 주변 시장 (없는 재료와 매칭)
      const markets = marketItems
        .filter(m => missing.some(miss => m.name.includes(miss) || miss.includes(m.name)))
        .reduce((acc, m) => {
          const exists = acc.find(a => a.name === (m.shopName || '동네 시장'));
          if (!exists) {
            acc.push({
              name:      m.shopName || '동네 시장',
              distance:  '도보 5분',
              specialty: `${m.emoji} ${m.name}${m.discountRate ? ` (${m.discountRate}% 할인)` : ''}`,
            });
          }
          return acc;
        }, []);

      setResult({ recipe: foodData.recipe, have, missing, markets });

    } catch (err) {
      console.error('음식 검색 실패:', err);
      showToast('검색 중 오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  /* ──────────────────────────────────────────
     장바구니 담기
  ────────────────────────────────────────── */
  const handleAddToCart = (ingName, marketItem, status) => {
    const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    if (cart.some(item => item.name === ingName)) {
      showToast(`'${ingName}'은(는) 이미 장바구니에 있어요!`);
      return;
    }
    const salePrice = status === SALE_STATUS.ON_SALE
      ? Math.round(marketItem.price * (1 - marketItem.discountRate / 100))
      : marketItem.price;
    cart.push({
      id:    Date.now() + Math.random(),
      name:  ingName,
      price: salePrice,
      emoji: marketItem?.emoji || '🛒',
      desc:  `${marketItem.shopName} · ${status === SALE_STATUS.ON_SALE ? `${marketItem.discountRate}% 할인가` : '정상가'}`,
    });
    localStorage.setItem('cartItems', JSON.stringify(cart));
    showToast(`'${ingName}'을(를) 장바구니에 담았어요! 🛒`);
  };

  /* ──────────────────────────────────────────
     레시피 저장 (버튼 클릭 시만)
  ────────────────────────────────────────── */
  const handleSaveRecipe = (recipe) => {
    const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    if (!saved.some(r => r.id === recipe.id)) {
      saved.push(recipe);
      localStorage.setItem('savedRecipes', JSON.stringify(saved));
      showToast(`'${recipe.name}' 레시피를 레시피북에 저장했어요! 📖`);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div className="rr-overlay" onClick={onClose}>
      <div className="rr-modal" onClick={e => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="rr-header" style={{ borderLeft: '4px solid #FF6B35' }}>
          {result ? (
            <button className="rr-back-btn" style={{ color: '#FF6B35' }}
              onClick={() => setResult(null)}>
              ← 다시 검색
            </button>
          ) : (
            <span className="rr-header-title">🍽 먹고 싶은 음식 찾기</span>
          )}
          <button className="rr-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* 바디 */}
        <div className="rr-body">

          {/* ── 검색 화면 ── */}
          {!result && (
            <div className="fs-search-view">

              {/* 검색창 */}
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

              {/* 로딩 */}
              {loading && (
                <div className="rr-loading">
                  <div className="rr-spinner" style={{ borderTopColor: '#FF6B35' }} />
                  <p>"{query}" 레시피를 분석하는 중...</p>
                </div>
              )}

              {/* 최근 검색어 */}
              {!loading && history.length > 0 && (
                <div className="fs-history-wrap">
                  <div className="fs-history-title">🕐 최근 검색</div>
                  <div className="fs-history-list">
                    {history.map((h, i) => (
                      <button
                        key={i}
                        className="fs-history-chip"
                        onClick={() => { setQuery(h); }}
                      >
                        {h}
                      </button>
                    ))}
                    <button
                      className="fs-history-clear"
                      onClick={() => {
                        setHistory([]);
                        localStorage.removeItem('foodSearchHistory');
                      }}
                    >
                      전체 삭제
                    </button>
                  </div>
                </div>
              )}

              {/* 추천 음식 */}
              {!loading && (
                <div className="fs-suggest-wrap">
                  <div className="fs-suggest-title">💡 이런 음식은 어때요?</div>
                  <div className="fs-suggest-grid">
                    {['파스타', '된장찌개', '볶음밥', '비빔밥', '라면', '김치찌개', '카레', '샐러드'].map(food => (
                      <button
                        key={food}
                        className="fs-suggest-chip"
                        onClick={() => { setQuery(food); }}
                      >
                        {food}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 검색 결과 상세 ── */}
          {result && !loading && (
            <FoodResultDetail
              result={result}
              marketItems={marketItems}
              myIngredients={myIngredients}
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