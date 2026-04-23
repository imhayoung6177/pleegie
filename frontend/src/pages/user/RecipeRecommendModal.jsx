import React, { useState, useEffect } from 'react';
import '../../Styles/common/RecipeRecommendModal.css';


/* ══════════════════════════════════════════════════════════
   할인 상태 계산
══════════════════════════════════════════════════════════ */
const SALE_STATUS = { NONE: 'NONE', UPCOMING: 'UPCOMING', ON_SALE: 'ON_SALE' };

const getSaleStatus = (item, now) => {
  if (!item?.saleStart || !item?.saleEnd || !item?.discountRate) return SALE_STATUS.NONE;
  const [sh, sm] = item.saleStart.split(':').map(Number);
  const [eh, em] = item.saleEnd.split(':').map(Number);
  const start = new Date(now); start.setHours(sh, sm, 0, 0);
  const end   = new Date(now); end.setHours(eh, em, 0, 0);
  const soon  = new Date(start.getTime() - 60 * 60 * 1000);
  if (now >= start && now < end)  return SALE_STATUS.ON_SALE;
  if (now >= soon  && now < start) return SALE_STATUS.UPCOMING;
  return SALE_STATUS.NONE;
};

/* ══════════════════════════════════════════════════════════
   ✅ 없는 재료 카드 — 시장 연동 + 할인 UI
══════════════════════════════════════════════════════════ */
const MissingIngredientCard = ({ ingName, marketItems, onAddToCart }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // ✅ 핵심: localStorage(ShopPage에서 저장)에서 재료명으로 검색
  const marketItem = marketItems?.find(m =>
    m.name.includes(ingName) || ingName.includes(m.name)
  );

  const status = getSaleStatus(marketItem, now);

  const salePrice = marketItem && status === SALE_STATUS.ON_SALE
    ? Math.round(marketItem.price * (1 - marketItem.discountRate / 100))
    : null;

  return (
    <div className={`missing-card missing-card--${status.toLowerCase()}`}>

      {/* ── 재료명 행 ── */}
      <div className="missing-card-top">
        <span className="missing-card-name">{ingName}</span>

        {/* 할인 상태 배지 */}
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

      {/* ── 시장 정보 (시장에 올라온 재료만 표시) ── */}
      {marketItem && (
        <div className="missing-card-market">
          <span className="market-name-text">🏪 {marketItem.shopName}</span>
          <div className="market-price-row">
            {/* 할인 중일 때: 원가에 취소선 + 할인가 */}
            {status === SALE_STATUS.ON_SALE && (
              <>
                <span className="price-original">
                  {marketItem.price.toLocaleString()}원
                </span>
                <span className="price-sale">
                  {salePrice.toLocaleString()}원/{marketItem.unit}
                </span>
                <span className="discount-rate-badge">
                  -{marketItem.discountRate}%
                </span>
              </>
            )}
            {/* 할인 예정일 때: 원가 + 할인 예정율 */}
            {status === SALE_STATUS.UPCOMING && (
              <>
                <span className="price-normal">
                  {marketItem.price.toLocaleString()}원/{marketItem.unit}
                </span>
                <span className="upcoming-rate-badge">
                  {marketItem.saleStart} 부터 {marketItem.discountRate}% 할인
                </span>
              </>
            )}
            {/* 할인 없음: 원가만 */}
            {status === SALE_STATUS.NONE && (
              <span className="price-normal">
                {marketItem.price.toLocaleString()}원/{marketItem.unit}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── 구매 버튼 (시장에 있을 때만) ── */}
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
        <div className="missing-no-market">
          근처 시장에 아직 등록된 상품이 없어요
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   레시피 리스트 카드
══════════════════════════════════════════════════════════ */
const RecipeListCard = ({ recipe, marketItems, onClick }) => {
  const [now] = useState(new Date());

  const saleFlags = recipe.missing?.map(name => {
    const m = marketItems?.find(mi => mi.name.includes(name) || name.includes(mi.name));
    return getSaleStatus(m, now);
  }) || [];

  const hasOnSale  = saleFlags.includes(SALE_STATUS.ON_SALE);
  const hasUpcoming = saleFlags.includes(SALE_STATUS.UPCOMING);

  return (
    <div className="recipe-list-card" onClick={onClick}>
      <div className="recipe-card-top">
        <span className="recipe-card-emoji">{recipe.emoji}</span>
        <div className="recipe-card-info">
          <strong className="recipe-card-name">{recipe.name}</strong>
          <span className="recipe-card-meta">
            ⏱ {recipe.time} · 난이도: {recipe.difficulty}
          </span>
        </div>
        {/* 없는 재료 중 할인 있으면 카드에 배지 표시 */}
        {hasOnSale && (
          <span className="sale-badge sale-badge--on-sale">🔴 할인 중</span>
        )}
        {!hasOnSale && hasUpcoming && (
          <span className="sale-badge sale-badge--upcoming">⏰ 할인 예정</span>
        )}
      </div>

      <div className="recipe-card-tags">
        {recipe.matched?.map(m => (
          <span key={m} className="recipe-tag recipe-tag--have">{m}</span>
        ))}
        {recipe.missing?.map(m => (
          <span key={m} className="recipe-tag recipe-tag--missing">+{m}</span>
        ))}
      </div>

      <div className="recipe-card-match">
        <div className="match-bar-wrap">
          <div className="match-bar-fill" style={{ width: `${recipe.matchRate}%` }} />
        </div>
        <span className="match-rate-text">재료 {recipe.matchRate}% 보유</span>
      </div>
      <span className="recipe-card-arrow">›</span>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   ✅ 레시피 상세 — 저장 버튼 UI 포함
══════════════════════════════════════════════════════════ */
const RecipeDetail = ({ recipe, marketItems, onBack, onAddToCart, onSave }) => {
  const [saveState, setSaveState] = useState(() => {
    const savedList = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    return savedList.some(r => r.id === recipe.id) ? 'saved' : 'idle';
    // idle: 미저장 / saving: 저장중 / saved: 저장완료
  });

  const handleSave = async () => {
    if (saveState !== 'idle') return;
    setSaveState('saving');
    await new Promise(r => setTimeout(r, 600)); // 저장 중 애니메이션 효과
    onSave(recipe);
    setSaveState('saved');
  };

  return (
    <div className="recipe-detail-view">

      <button className="recipe-detail-back" onClick={onBack}>
        ← 레시피 목록
      </button>

      {/* 헤더 */}
      <div className="recipe-detail-header">
        <span className="recipe-detail-emoji">{recipe.emoji}</span>
        <div className="recipe-detail-title-wrap">
          <h2 className="recipe-detail-title">{recipe.name}</h2>
          <p className="recipe-detail-meta">⏱ {recipe.time} · 난이도: {recipe.difficulty}</p>
        </div>
      </div>

      {/* ✅ 저장 버튼 — 3가지 상태 (idle / saving / saved) */}
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

      {/* ✅ 없는 재료 + 시장 연동 */}
      {recipe.missing?.length > 0 && (
        <div className="recipe-detail-section">
          <div className="recipe-section-title missing-title">
            🛒 없는 재료
          </div>
          <div className="missing-legend">
            <span className="legend-dot legend-dot--on-sale" />
            <span>할인 중</span>
            <span className="legend-dot legend-dot--upcoming" />
            <span>할인 예정</span>
            <span className="legend-dot legend-dot--none" />
            <span>일반</span>
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

      {/* 전체 재료 */}
      <div className="recipe-detail-section">
        <div className="recipe-section-title">📋 필요 재료</div>
        <div className="recipe-tag-row">
          {recipe.ingredients?.map(ing => (
            <span key={ing} className="recipe-tag recipe-tag--ingredient">{ing}</span>
          ))}
        </div>
      </div>

      {/* 조리 순서 */}
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

  // ✅ ShopPage에서 저장한 marketItems 읽기
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('marketItems') || '[]');
    setMarketItems(saved);
    // 나중에 백엔드 연동: const res = await fetch('/api/market/items');
  }, []);

  // 레시피 로드 (목 데이터 → 나중에 API 교체)
  useEffect(() => {
    const t = setTimeout(() => {
      setRecipes([
        {
          id: 101, emoji: '🍳', name: '계란볶음밥',
          time: '15분', difficulty: '쉬움', matchRate: 95,
          matched: ['계란', '쌀', '간장', '파'],
          missing: ['햄', '시금치'],
          ingredients: ['계란 2개', '밥 1공기', '간장 1큰술', '파 약간', '참기름', '햄 50g'],
          steps: [
            '파를 잘게 썰어 준비합니다.',
            '달궈진 팬에 기름을 두르고 햄을 볶습니다.',
            '계란을 넣고 스크램블합니다.',
            '밥을 넣고 강불에서 볶아줍니다.',
            '간장, 참기름을 넣고 파를 올려 완성합니다.',
          ],
        },
        {
          id: 102, emoji: '🥘', name: '된장찌개',
          time: '20분', difficulty: '쉬움', matchRate: 88,
          matched: ['된장', '애호박', '양파'],
          missing: ['두부', '대파'],
          ingredients: ['된장 2큰술', '두부 1/2모', '애호박 1/4개', '양파 1/4개', '멸치육수 2컵'],
          steps: [
            '멸치육수를 냄비에 넣고 끓입니다.',
            '된장을 풀어 넣습니다.',
            '두부, 애호박, 양파를 넣고 10분 끓입니다.',
            '기호에 따라 청양고추를 넣어 완성합니다.',
          ],
        },
        {
          id: 103, emoji: '🍜', name: '소고기무국',
          time: '30분', difficulty: '보통', matchRate: 75,
          matched: ['소고기', '간장', '마늘'],
          missing: ['무', '대파'],
          ingredients: ['소고기 150g', '무 200g', '간장 2큰술', '마늘 1큰술', '참기름', '물 4컵'],
          steps: [
            '소고기를 참기름에 볶아줍니다.',
            '무를 나박썰기하여 넣고 함께 볶습니다.',
            '물을 붓고 20분간 끓입니다.',
            '간장과 소금으로 간을 맞춰 완성합니다.',
          ],
        },
      ]);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(t);
  }, [myIngredients]);

  // 장바구니 담기
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

  // 레시피 저장 (버튼 클릭 시만 — 자동저장 X)
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
              {recipes.map(recipe => (
                <RecipeListCard
                  key={recipe.id}
                  recipe={recipe}
                  marketItems={marketItems}
                  onClick={() => setSelectedRecipe(recipe)}
                />
              ))}
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