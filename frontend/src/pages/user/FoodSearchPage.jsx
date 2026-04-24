import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/user/RecipeRecommendPage.css';

/* ══════════════════════════════════════════════════════════
    할인 상태 계산 로직 (RecipeRecommendPage와 동일)
══════════════════════════════════════════════════════════ */
const SALE_STATUS = { NONE: 'NONE', UPCOMING: 'UPCOMING', ON_SALE: 'ON_SALE' };

const getSaleStatus = (item, now) => {
  if (!item?.saleStart || !item?.saleEnd || !item?.discountRate) return SALE_STATUS.NONE;
  const [sh, sm] = item.saleStart.split(':').map(Number);
  const [eh, em] = item.saleEnd.split(':').map(Number);
  const start = new Date(now); start.setHours(sh, sm, 0, 0);
  const end = new Date(now); end.setHours(eh, em, 0, 0);
  const soon = new Date(start.getTime() - 60 * 60 * 1000);
  if (now >= start && now < end) return SALE_STATUS.ON_SALE;
  if (now >= soon && now < start) return SALE_STATUS.UPCOMING;
  return SALE_STATUS.NONE;
};

/* ══════════════════════════════════════════════════════════
    시장 연동형 부족 재료 카드 컴포넌트
══════════════════════════════════════════════════════════ */
const MissingIngredientCard = ({ ingName, marketItems, onAddToCart }) => {
  const [now] = useState(new Date());
  const marketItem = marketItems?.find(m => m.name.includes(ingName) || ingName.includes(m.name));
  const status = getSaleStatus(marketItem, now);
  const salePrice = marketItem && status === SALE_STATUS.ON_SALE
    ? Math.round(marketItem.price * (1 - marketItem.discountRate / 100))
    : null;

  return (
    <div className={`rrp-missing-card rrp-missing-card--${status.toLowerCase()}`}>
      <div className="rrp-missing-top">
        <span className="rrp-missing-name">{ingName}</span>
        {status === SALE_STATUS.ON_SALE && <span className="rrp-badge rrp-badge--on-sale">🔴 할인 중</span>}
        {status === SALE_STATUS.UPCOMING && <span className="rrp-badge rrp-badge--upcoming">⏰ 할인 예정</span>}
      </div>

      {marketItem ? (
        <>
          <div className="rrp-market-info">
            <span className="rrp-shop-name">🏪 {marketItem.shopName}</span>
            <div className="rrp-price-row">
              {status === SALE_STATUS.ON_SALE ? (
                <>
                  <span className="rrp-price-original">{marketItem.price.toLocaleString()}원</span>
                  <span className="rrp-price-sale">{salePrice.toLocaleString()}원</span>
                </>
              ) : (
                <span className="rrp-price-normal">{marketItem.price.toLocaleString()}원</span>
              )}
            </div>
          </div>
          <button className={`rrp-buy-btn rrp-buy-btn--${status.toLowerCase()}`} 
                  onClick={() => onAddToCart(ingName, marketItem, status)}>
            {status === SALE_STATUS.ON_SALE ? `🔴 지금 구매 (-${marketItem.discountRate}%)` : `🛒 장바구니 담기`}
          </button>
        </>
      ) : (
        <p className="rrp-no-market">근처 시장에 정보가 없습니다.</p>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
    메인 FoodSearchPage 컴포넌트
══════════════════════════════════════════════════════════ */
export default function FoodSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const [toast, setToast] = useState('');
  const [marketItems, setMarketItems] = useState([]);

  useEffect(() => {
    const market = JSON.parse(localStorage.getItem('marketItems') || '[]');
    setMarketItems(market);
  }, []);

  useEffect(() => {
    if (result?.recipe) {
      const savedList = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      setSaveState(savedList.some(r => r.id === result.recipe.id) ? 'saved' : 'idle');
    }
  }, [result]);

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    // ✅ 데모용 데이터 (나중엔 백엔드 API 연결)
    setTimeout(() => {
      const fridgeItems = JSON.parse(localStorage.getItem('fridgeItems') || '[]');
      const myIngredientNames = fridgeItems.map(i => i.name);

      // 음식별 레시피 데이터 (검색 매칭용 DB)
      const FOOD_DB = {
        '파스타': {
          recipe: {
            id: 201, emoji: '🍝', name: '토마토 파스타', time: '25분', difficulty: '보통',
            ingredients: ['파스타 200g', '올리브오일 3큰술', '마늘 3쪽', '베이컨 100g', '파마산치즈', '소금', '후추'],
            steps: [
              '소금물에 파스타를 8~10분간 삶습니다.',
              '팬에 올리브오일을 두르고 마늘을 볶습니다.',
              '베이컨을 넣고 함께 볶아줍니다.',
              '삶은 파스타를 넣고 버무립니다.',
              '파마산치즈를 뿌리고 후추로 마무리합니다.',
            ],
            summary: '집에서 즐기는 이탈리아의 맛! 간단한 재료로 근사한 파스타를 완성해보세요.'
          },
          allIngredients: ['파스타', '올리브오일', '마늘', '베이컨', '파마산치즈', '소금', '후추'],
        },
        '된장찌개': {
          recipe: {
            id: 202, emoji: '🥘', name: '된장찌개', time: '20분', difficulty: '쉬움',
            ingredients: ['된장 2큰술', '두부 1/2모', '애호박 1/4개', '양파 1/4개', '멸치육수 2컵', '청양고추'],
            steps: [
              '멸치육수를 냄비에 넣고 끓입니다.',
              '된장을 풀어 넣습니다.',
              '두부, 애호박, 양파를 넣고 10분 끓입니다.',
              '청양고추를 넣어 완성합니다.',
            ],
            summary: '구수한 된장 향이 일품인 한국인의 소울푸드! 밥 한 공기 뚝딱 비우게 될 거예요.'
          },
          allIngredients: ['된장', '두부', '애호박', '양파', '멸치육수', '청양고추'],
        },
        '볶음밥': {
          recipe: {
            id: 203, emoji: '🍳', name: '계란볶음밥', time: '15분', difficulty: '쉬움',
            ingredients: ['계란 2개', '밥 1공기', '간장 1큰술', '파 약간', '참기름', '소금'],
            steps: [
              '파를 잘게 썰어 파기름을 냅니다.',
              '계란을 풀어서 스크램블을 만듭니다.',
              '밥을 넣고 볶다가 간장과 소금으로 간을 합니다.',
              '참기름을 살짝 두르고 마무리합니다.'
            ],
            summary: '냉장고 파먹기의 정석! 고소한 계란과 파기름의 조화가 완벽해요.'
          },
          allIngredients: ['계란', '밥', '간장', '파', '참기름', '소금'],
        }
      };

      const found = Object.entries(FOOD_DB).find(([key]) => query.includes(key) || key.includes(query));
      
      const foodData = found ? found[1] : {
        recipe: {
          id: Date.now(),
          emoji: '🍽',
          name: query,
          time: '30분',
          difficulty: '보통',
          ingredients: [`${query}용 메인 재료`, '양파 1/2개', '마늘 1큰술', '소금', '후추'],
          steps: [
            '재료를 깨끗하게 손질하고 알맞은 크기로 썹니다.',
            '팬에 기름을 두르고 야채와 메인 재료를 볶아줍니다.',
            '양념을 넣고 중불에서 10분간 더 조리하여 완성합니다.'
          ],
          summary: `집에서도 간편하게 즐기는 ${query}! 신선한 재료만 있다면 전문점 부럽지 않은 맛을 낼 수 있어요.`
        },
        allIngredients: [`${query}용 메인 재료`, '양파', '마늘', '소금', '후추'],
      };

      const have = foodData.allIngredients.filter(ing => myIngredientNames.some(my => my.includes(ing) || ing.includes(my)));
      const missing = foodData.allIngredients.filter(ing => !myIngredientNames.some(my => my.includes(ing) || ing.includes(my)));
      
      setResult({ recipe: foodData.recipe, have, missing });
      setLoading(false);
    }, 1200);
  };

  const handleAddToCart = (ingName, marketItem, status) => {
    const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    if (cart.some(item => item.name === ingName)) {
      showToast(`'${ingName}'은 이미 장바구니에 있습니다.`);
      return;
    }
    const finalPrice = status === SALE_STATUS.ON_SALE 
      ? Math.round(marketItem.price * (1 - marketItem.discountRate / 100)) 
      : marketItem.price;

    cart.push({
      id: Date.now(),
      name: ingName,
      price: finalPrice,
      emoji: '🛒',
      desc: marketItem.shopName
    });
    localStorage.setItem('cartItems', JSON.stringify(cart));
    showToast(`'${ingName}'을(를) 장바구니에 담았습니다!`);
  };

  const handleSaveRecipe = async () => {
    if (saveState !== 'idle' || !result) return;
    setSaveState('saving');
    await new Promise(r => setTimeout(r, 600));

    const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    if (!saved.some(r => r.id === result.recipe.id)) {
      saved.push(result.recipe);
      localStorage.setItem('savedRecipes', JSON.stringify(saved));
      showToast(`'${result.recipe.name}' 레시피를 레시피북에 저장했어요! 📖`);
    }
    setSaveState('saved');
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  return (
    <div className="rrp-page">
      <div className="rrp-header">
        <button className="rrp-header-back" onClick={() => navigate(-1)}>←</button>
        <span className="rrp-header-title">메뉴 검색 추천</span>
        <div style={{ width: 40 }} />
      </div>

      <div className="rrp-body">
        <div style={{ 
          background: 'rgba(0,0,0,0.02)', 
          border: '1.5px solid rgba(0,0,0,0.08)', 
          borderRadius: '16px', 
          padding: '16px 18px', 
          marginBottom: '20px' 
        }}>
          <div className="search-row" style={{display:'flex', gap:'10px'}}>
            <input className="food-inp" 
                   style={{flex:1, padding:'12px 16px', borderRadius:'12px', border:'1.5px solid rgba(0,0,0,0.12)', outline: 'none'}}
                   type="text" placeholder="먹고 싶은 메뉴를 입력하세요" 
                   value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} autoFocus />
            <button className="ai-btn ai-btn-orange" onClick={handleSearch} disabled={loading}>검색</button>
          </div>
        </div>

        {loading && <div className="rrp-loading"><div className="rrp-loading-spinner" /><p>분석 중...</p></div>}

        {result && (
          <div className="rrp-detail">
            {/* 레시피 헤더 */}
            <div className="rrp-detail-header" style={{ marginBottom: '16px' }}>
              <span className="rrp-detail-emoji">{result.recipe.emoji}</span>
              <div>
                <h2 className="rrp-detail-title">{result.recipe.name}</h2>
                <p className="rrp-detail-meta">⏱ {result.recipe.time} · 난이도 {result.recipe.difficulty}</p>
              </div>
            </div>

            {/* 레시피 저장 버튼 */}
            <button
              className={`rrp-save-btn rrp-save-btn--${saveState}`}
              onClick={handleSaveRecipe}
              disabled={saveState !== 'idle'}
              style={{ marginBottom: '20px' }}
            >
              <span>
                {saveState === 'idle'   && '📖 레시피북에 저장하기'}
                {saveState === 'saving' && '⏳ 저장 중...'}
                {saveState === 'saved'  && '✅ 저장 완료!'}
              </span>
            </button>

            {/* 있는 재료 */}
            <div className="rrp-section">
              <div className="rrp-section-title rrp-section-title--have">✅ 내 냉장고에 있는 재료</div>
              <div className="rrp-tag-row">
                {result.have.map(i => <span key={i} className="rrp-tag rrp-tag--have">{i}</span>)}
              </div>
            </div>

            {/* 없는 재료 (시장 연동 카드) */}
            <div className="rrp-section">
              <div className="rrp-section-title rrp-section-title--missing">🛒 부족한 재료 - 시장에서 구매</div>
              <div className="rrp-missing-list">
                {result.missing.map(ing => (
                  <MissingIngredientCard 
                    key={ing} 
                    ingName={ing} 
                    marketItems={marketItems} 
                    onAddToCart={handleAddToCart} 
                  />
                ))}
              </div>
            </div>

            {/* 조리 순서 */}
            <div className="rrp-section">
              <div className="rrp-section-title">🍳 조리 순서</div>
              <div className="rrp-steps">
                {result.recipe.steps.map((step, i) => (
                  <div key={i} className="rrp-step">
                    <div className="rrp-step-num">{i + 1}</div>
                    <span className="rrp-step-text">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {toast && <div className="rrp-toast">{toast}</div>}
    </div>
  );
}