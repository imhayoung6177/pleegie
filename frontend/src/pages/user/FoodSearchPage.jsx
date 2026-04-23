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
  const [toast, setToast] = useState('');
  const [marketItems, setMarketItems] = useState([]);

  useEffect(() => {
    const market = JSON.parse(localStorage.getItem('marketItems') || '[]');
    setMarketItems(market);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    // ✅ 데모용 데이터 (나중엔 백엔드 API 연결)
    setTimeout(() => {
      const fridgeItems = JSON.parse(localStorage.getItem('fridgeItems') || '[]');
      
      const mockResult = {
        recipe: {
          id: Date.now(),
          emoji: '🍛',
          name: query,
          time: '30분',
          difficulty: '보통',
          ingredients: [query + ' 재료 200g', '양파 1/2개', '마늘 1큰술'],
          steps: [
            `${query}를 먹기 좋은 크기로 썹니다.`,
            '팬에 기름을 두르고 양파와 함께 볶습니다.',
            '양념을 넣고 중불에서 10분간 더 졸여 완성합니다.'
          ],
          summary: `집에서도 간편하게 즐기는 ${query}! 신선한 재료만 있다면 전문점 부럽지 않은 맛을 낼 수 있어요.`
        },
        have: fridgeItems.slice(0, 2).map(i => i.name),
        missing: ['돼지고기', '대파'] // 예시 부족 재료
      };
      
      setResult(mockResult);
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

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  return (
    <div className="rrp-page">
      <div className="rrp-header">
        <button className="rrp-header-back" onClick={() => navigate(-1)}>←</button>
        <span className="rrp-header-title">메뉴 검색 추천</span>
        <div style={{ width: 40 }} />
      </div>

      <div className="rrp-body">
        <div className="rrp-ai-section">
          <div className="search-row" style={{display:'flex', gap:'10px'}}>
            <input className="food-inp" style={{flex:1, padding:'12px', borderRadius:'10px', border:'1px solid #ddd'}}
                   type="text" placeholder="먹고 싶은 메뉴 입력" 
                   value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button className="ai-btn ai-btn-orange" onClick={handleSearch} disabled={loading}>검색</button>
          </div>
        </div>

        {loading && <div className="rrp-loading"><div className="rrp-loading-spinner" /><p>분석 중...</p></div>}

        {result && (
          <div className="rrp-detail">
            {/* 레시피 헤더 */}
            <div className="rrp-detail-header">
              <span className="rrp-detail-emoji">{result.recipe.emoji}</span>
              <div>
                <h2 className="rrp-detail-title">{result.recipe.name}</h2>
                <p className="rrp-detail-meta">⏱ {result.recipe.time} · 난이도 {result.recipe.difficulty}</p>
              </div>
            </div>

            {/* AI 요약 */}
            <div className="rrp-ai-result" style={{margin: '15px 0'}}>
              <p className="rrp-ai-text">✨ {result.recipe.summary}</p>
            </div>

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