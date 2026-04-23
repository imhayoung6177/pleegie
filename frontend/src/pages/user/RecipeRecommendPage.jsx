import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/user/RecipeRecommendPage.css';

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
  if (now >= start && now < end)   return SALE_STATUS.ON_SALE;
  if (now >= soon  && now < start) return SALE_STATUS.UPCOMING;
  return SALE_STATUS.NONE;
};

/* ══════════════════════════════════════════════════════════
   목 레시피 데이터
   나중에 백엔드 API 응답으로 교체
══════════════════════════════════════════════════════════ */
const MOCK_RECIPES = [
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
    summary: '냉장고 재료로 10분 안에 뚝딱! 고소하고 든든한 한 끼예요.',
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
    summary: '집밥의 정석! 구수한 된장 향이 입맛을 돋워줘요.',
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
    summary: '시원하고 깊은 국물이 일품! 속을 따뜻하게 채워줘요.',
  },
];

/* ══════════════════════════════════════════════════════════
   없는 재료 카드
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
  const status   = getSaleStatus(marketItem, now);
  const salePrice = marketItem && status === SALE_STATUS.ON_SALE
    ? Math.round(marketItem.price * (1 - marketItem.discountRate / 100))
    : null;

  return (
    <div className={`rrp-missing-card rrp-missing-card--${status.toLowerCase()}`}>
      <div className="rrp-missing-top">
        <span className="rrp-missing-name">{ingName}</span>
        {status === SALE_STATUS.ON_SALE && (
          <span className="rrp-badge rrp-badge--on-sale">🔴 할인 중</span>
        )}
        {status === SALE_STATUS.UPCOMING && (
          <span className="rrp-badge rrp-badge--upcoming">⏰ 할인 예정</span>
        )}
        {!marketItem && (
          <span className="rrp-badge rrp-badge--none">미등록</span>
        )}
      </div>

      {marketItem && (
        <div className="rrp-market-info">
          <span className="rrp-shop-name">🏪 {marketItem.shopName}</span>
          <div className="rrp-price-row">
            {status === SALE_STATUS.ON_SALE && (
              <>
                <span className="rrp-price-original">
                  {marketItem.price.toLocaleString()}원
                </span>
                <span className="rrp-price-sale">
                  {salePrice.toLocaleString()}원/{marketItem.unit}
                </span>
                <span className="rrp-discount-badge">
                  -{marketItem.discountRate}%
                </span>
              </>
            )}
            {status === SALE_STATUS.UPCOMING && (
              <>
                <span className="rrp-price-normal">
                  {marketItem.price.toLocaleString()}원/{marketItem.unit}
                </span>
                <span className="rrp-upcoming-badge">
                  {marketItem.saleStart}부터 {marketItem.discountRate}% 할인
                </span>
              </>
            )}
            {status === SALE_STATUS.NONE && (
              <span className="rrp-price-normal">
                {marketItem.price.toLocaleString()}원/{marketItem.unit}
              </span>
            )}
          </div>
        </div>
      )}

      {marketItem ? (
        <button
          className={`rrp-buy-btn rrp-buy-btn--${status.toLowerCase()}`}
          onClick={() => onAddToCart(ingName, marketItem, status)}
        >
          {status === SALE_STATUS.ON_SALE  && `🔴 지금 구매 (${marketItem.discountRate}% 할인)`}
          {status === SALE_STATUS.UPCOMING && `⏰ 장바구니 담기 (곧 할인 시작)`}
          {status === SALE_STATUS.NONE     && `🛒 장바구니에 담기`}
        </button>
      ) : (
        <p className="rrp-no-market">근처 시장에 아직 등록된 상품이 없어요</p>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   레시피 리스트 카드
══════════════════════════════════════════════════════════ */
const RecipeCard = ({ recipe, marketItems, onClick }) => {
  const [now] = useState(new Date());

  const saleFlags = recipe.missing?.map(name => {
    const m = marketItems?.find(mi => mi.name.includes(name) || name.includes(mi.name));
    return getSaleStatus(m, now);
  }) || [];

  const hasOnSale  = saleFlags.includes(SALE_STATUS.ON_SALE);
  const hasUpcoming = saleFlags.includes(SALE_STATUS.UPCOMING);

  return (
    <div className="rrp-recipe-card" onClick={onClick}>
      <div className="rrp-card-left">
        <span className="rrp-card-emoji">{recipe.emoji}</span>
      </div>
      <div className="rrp-card-body">
        <div className="rrp-card-top">
          <strong className="rrp-card-name">{recipe.name}</strong>
          {hasOnSale && (
            <span className="rrp-badge rrp-badge--on-sale">🔴 할인 중</span>
          )}
          {!hasOnSale && hasUpcoming && (
            <span className="rrp-badge rrp-badge--upcoming">⏰ 할인 예정</span>
          )}
        </div>
        <span className="rrp-card-meta">
          ⏱ {recipe.time} · 난이도: {recipe.difficulty}
        </span>

        {/* 재료 태그 */}
        <div className="rrp-card-tags">
          {recipe.matched?.map(m => (
            <span key={m} className="rrp-tag rrp-tag--have">{m}</span>
          ))}
          {recipe.missing?.map(m => (
            <span key={m} className="rrp-tag rrp-tag--missing">+{m}</span>
          ))}
        </div>

        {/* 매칭률 바 */}
        <div className="rrp-match-row">
          <div className="rrp-match-bar">
            <div className="rrp-match-fill" style={{ width: `${recipe.matchRate}%` }} />
          </div>
          <span className="rrp-match-text">{recipe.matchRate}%</span>
        </div>
      </div>
      <div className="rrp-card-arrow">›</div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   레시피 상세 화면
══════════════════════════════════════════════════════════ */
const RecipeDetail = ({ recipe, marketItems, onBack, onAddToCart }) => {
  // AI 요약 상태
  const [aiSummary,     setAiSummary]     = useState('');
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiGenerated,   setAiGenerated]   = useState(false);

  // 저장 상태
  const [saveState, setSaveState] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    return saved.some(r => r.id === recipe.id) ? 'saved' : 'idle';
  });

  /* ──────────────────────────────────────────
     ✅ AI 요약 — 버튼 클릭 시 페이지에서 바로 실행
     현재: 목 텍스트 타이핑 효과
     나중에: POST /api/ai/recipe-summary 로 교체
  ────────────────────────────────────────── */
  const handleAiSummary = async () => {
    if (aiLoading || aiGenerated) return;
    setAiLoading(true);
    setAiSummary('');

    try {
      // ✅ [백엔드 연동 포인트]
      // const res = await fetch('/api/ai/recipe-summary', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ recipeName: recipe.name, ingredients: recipe.ingredients }),
      // });
      // const data = await res.json();
      // const fullText = data.summary;

      // 현재: 목 텍스트를 타이핑 효과로 출력
      const fullText = recipe.summary ||
        `${recipe.name}은(는) ${recipe.matched?.join(', ')} 등 냉장고 재료로 ` +
        `${recipe.time} 안에 만들 수 있어요! ` +
        `난이도는 ${recipe.difficulty}이며, ` +
        `${recipe.missing?.length > 0
          ? `${recipe.missing.join(', ')}만 추가로 구매하면 완성할 수 있습니다.`
          : '모든 재료가 준비되어 있어요! 바로 시작해보세요.'}`;

      // 타이핑 효과
      let i = 0;
      const interval = setInterval(() => {
        setAiSummary(fullText.slice(0, i + 1));
        i++;
        if (i >= fullText.length) {
          clearInterval(interval);
          setAiLoading(false);
          setAiGenerated(true);
        }
      }, 30);

    } catch (err) {
      console.error('AI 요약 실패:', err);
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (saveState !== 'idle') return;
    setSaveState('saving');
    await new Promise(r => setTimeout(r, 600));
    const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    if (!saved.some(r => r.id === recipe.id)) {
      saved.push(recipe);
      localStorage.setItem('savedRecipes', JSON.stringify(saved));
    }
    setSaveState('saved');
  };

  return (
    <div className="rrp-detail">

      {/* 뒤로가기 */}
      <button className="rrp-back-btn" onClick={onBack}>
        ← 레시피 목록
      </button>

      {/* 헤더 */}
      <div className="rrp-detail-header">
        <span className="rrp-detail-emoji">{recipe.emoji}</span>
        <div>
          <h2 className="rrp-detail-title">{recipe.name}</h2>
          <p className="rrp-detail-meta">⏱ {recipe.time} · 난이도: {recipe.difficulty}</p>
        </div>
      </div>

      {/* ✅ AI 요약 섹션 — 버튼 클릭 시 바로 실행 */}
      <div className="rrp-ai-section">
        <div className="rrp-ai-header">
          <span className="rrp-ai-label">✨ AI 요약</span>
          {!aiGenerated && (
            <button
              className={`rrp-ai-btn ${aiLoading ? 'rrp-ai-btn--loading' : ''}`}
              onClick={handleAiSummary}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <>
                  <span className="rrp-ai-spinner" />
                  생성 중...
                </>
              ) : (
                '✨ AI 요약 보기'
              )}
            </button>
          )}
        </div>

        {/* AI 요약 텍스트 — 타이핑 효과 */}
        {(aiSummary || aiLoading) && (
          <div className="rrp-ai-result">
            <p className="rrp-ai-text">
              {aiSummary}
              {/* 타이핑 커서 */}
              {aiLoading && <span className="rrp-ai-cursor">|</span>}
            </p>
          </div>
        )}

        {/* 버튼 클릭 전 안내 */}
        {!aiSummary && !aiLoading && (
          <p className="rrp-ai-hint">
            버튼을 클릭하면 이 레시피를 AI가 바로 요약해드려요
          </p>
        )}
      </div>

      {/* 저장 버튼 */}
      <button
        className={`rrp-save-btn rrp-save-btn--${saveState}`}
        onClick={handleSave}
        disabled={saveState !== 'idle'}
      >
        <span>
          {saveState === 'idle'   && '📖 레시피북에 저장하기'}
          {saveState === 'saving' && '⏳ 저장 중...'}
          {saveState === 'saved'  && '✅ 저장 완료!'}
        </span>
      </button>

      {/* 보유 재료 */}
      {recipe.matched?.length > 0 && (
        <div className="rrp-section">
          <div className="rrp-section-title rrp-section-title--have">
            ✅ 보유 중인 재료
          </div>
          <div className="rrp-tag-row">
            {recipe.matched.map(ing => (
              <span key={ing} className="rrp-tag rrp-tag--have">{ing}</span>
            ))}
          </div>
        </div>
      )}

      {/* 없는 재료 + 시장 연동 */}
      {recipe.missing?.length > 0 && (
        <div className="rrp-section">
          <div className="rrp-section-title rrp-section-title--missing">
            🛒 없는 재료 — 시장에서 구매
          </div>
          <div className="rrp-legend">
            <span className="rrp-legend-dot rrp-legend-dot--on-sale" />
            <span>할인 중</span>
            <span className="rrp-legend-dot rrp-legend-dot--upcoming" />
            <span>할인 예정</span>
            <span className="rrp-legend-dot rrp-legend-dot--none" />
            <span>일반</span>
          </div>
          <div className="rrp-missing-list">
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

      {/* 필요 재료 전체 */}
      <div className="rrp-section">
        <div className="rrp-section-title">📋 필요 재료</div>
        <div className="rrp-tag-row">
          {recipe.ingredients?.map(ing => (
            <span key={ing} className="rrp-tag rrp-tag--ingredient">{ing}</span>
          ))}
        </div>
      </div>

      {/* 조리 순서 */}
      <div className="rrp-section">
        <div className="rrp-section-title">🍳 조리 순서</div>
        <div className="rrp-steps">
          {recipe.steps?.map((step, i) => (
            <div key={i} className="rrp-step">
              <div className="rrp-step-num">{i + 1}</div>
              <span className="rrp-step-text">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   메인 페이지
══════════════════════════════════════════════════════════ */
export default function RecipeRecommendPage() {
  const navigate = useNavigate();

  // 냉장고 재료 (FridgePage에서 localStorage로 공유)
  const [myIngredients, setMyIngredients] = useState([]);
  const [marketItems,   setMarketItems]   = useState([]);
  const [recipes,       setRecipes]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [toast,         setToast]         = useState('');

  useEffect(() => {
    // 냉장고 재료 로드
    const fridgeItems = JSON.parse(localStorage.getItem('fridgeItems') || '[]');
    setMyIngredients(fridgeItems);

    // 시장 데이터 로드
    const market = JSON.parse(localStorage.getItem('marketItems') || '[]');
    setMarketItems(market);

    // 레시피 로드
    // ✅ [백엔드 연동 포인트]
    // const names = fridgeItems.map(i => i.name).join(',');
    // fetch(`/api/recipes/recommend?ingredients=${names}`)
    //   .then(r => r.json())
    //   .then(data => { setRecipes(data); setLoading(false); });
    const t = setTimeout(() => {
      setRecipes(MOCK_RECIPES);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(t);
  }, []);

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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div className="rrp-page">

      {/* ══ 헤더 ══ */}
      <div className="rrp-header">
        <button className="rrp-header-back" onClick={() => navigate(-1)}>
          ←
        </button>
        <span className="rrp-header-title">
          {selectedRecipe ? selectedRecipe.name : 'AI 레시피 추천'}
        </span>
        <div style={{ width: 40 }} />
      </div>

      {/* ══ 바디 ══ */}
      <div className="rrp-body">

        {/* 로딩 */}
        {loading && (
          <div className="rrp-loading">
            <div className="rrp-loading-spinner" />
            <p className="rrp-loading-text">냉장고 재료로 레시피를 찾는 중...</p>
          </div>
        )}

        {/* 레시피 리스트 */}
        {!loading && !selectedRecipe && (
          <div className="rrp-list-view">
            <p className="rrp-list-desc">
              보유 재료 기준으로 만들 수 있는 레시피예요
            </p>
            <div className="rrp-recipe-list">
              {recipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  marketItems={marketItems}
                  onClick={() => setSelectedRecipe(recipe)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 레시피 상세 */}
        {!loading && selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            marketItems={marketItems}
            onBack={() => setSelectedRecipe(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </div>

      {/* 토스트 */}
      {toast && <div className="rrp-toast">{toast}</div>}
    </div>
  );
}