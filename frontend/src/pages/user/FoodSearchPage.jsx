import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/user/RecipeRecommendPage.css';

const SALE_STATUS = { NONE: 'NONE', UPCOMING: 'UPCOMING', ON_SALE: 'ON_SALE' };

// 할인 상태 계산 로직
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

// 부족 재료 카드
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
              ) : ( <span className="rrp-price-normal">{marketItem.price.toLocaleString()}원</span> )}
            </div>
          </div>
          <button className={`rrp-buy-btn rrp-buy-btn--${status.toLowerCase()}`} onClick={() => onAddToCart(ingName, marketItem, status)}>
            {status === SALE_STATUS.ON_SALE ? `🔴 지금 구매 (-${marketItem.discountRate}%)` : `🛒 장바구니 담기`}
          </button>
        </>
      ) : ( <p className="rrp-no-market">근처 시장에 정보가 없습니다.</p> )}
    </div>
  );
};

export default function FoodSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const [toast, setToast] = useState('');
  const [marketItems, setMarketItems] = useState([]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  useEffect(() => {
    const market = JSON.parse(localStorage.getItem('marketItems') || '[]');
    setMarketItems(market);
  }, []);

  // ✅ [수정] 백엔드 연동: 메뉴 이름으로 레시피 검색
  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      // 1. 백엔드에 검색 요청 (Spring Boot RecipeController)
      const response = await fetch(`/user/recipe/search?keyword=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders()
      });
      const resData = await response.json();

      if (response.ok && resData.data) {
        const recipe = resData.data; // RecipeResponse DTO
        
        // 2. 내 냉장고 재료와 비교 로직
        const fridgeItems = JSON.parse(localStorage.getItem('fridgeItems') || '[]');
        const myIngredientNames = fridgeItems.map(i => i.name);

        const recipeIngNames = recipe.recipeItems.map(ri => ri.name);
        const have = recipeIngNames.filter(rn => myIngredientNames.some(mn => mn.includes(rn) || rn.includes(mn)));
        const missing = recipeIngNames.filter(rn => !myIngredientNames.some(mn => mn.includes(rn) || rn.includes(mn)));

        setResult({ recipe, have, missing });
      } else {
        showToast("검색 결과가 없습니다.");
      }
    } catch (err) {
      console.error(err);
      showToast("서버 연결 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (ingName, marketItem, status) => {
    const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const finalPrice = status === SALE_STATUS.ON_SALE ? Math.round(marketItem.price * (1 - marketItem.discountRate / 100)) : marketItem.price;
    cart.push({ id: Date.now(), name: ingName, price: finalPrice, emoji: '🛒', desc: marketItem.shopName });
    localStorage.setItem('cartItems', JSON.stringify(cart));
    showToast(`'${ingName}'을(를) 장바구니에 담았습니다!`);
  };

  const handleSaveRecipe = async () => {
    if (saveState !== 'idle' || !result) return;
    setSaveState('saving');
    try {
      // ✅ [수정] 백엔드 레시피북 저장 API 호출
      const response = await fetch(`/user/recipe-book?recipeId=${result.recipe.id}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setSaveState('saved');
        showToast("레시피북에 저장되었습니다!");
      }
    } catch (err) { setSaveState('idle'); }
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
        <div className="search-box" style={{ background: 'rgba(0,0,0,0.02)', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '16px 18px', marginBottom: '20px' }}>
          <div className="search-row" style={{display:'flex', gap:'10px'}}>
            <input style={{flex:1, padding:'12px 16px', borderRadius:'12px', border:'1.5px solid rgba(0,0,0,0.12)', outline: 'none'}}
                   type="text" placeholder="먹고 싶은 메뉴를 입력하세요" 
                   value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button className="ai-btn ai-btn-orange" onClick={handleSearch} disabled={loading}>검색</button>
          </div>
        </div>

        {loading && <div className="rrp-loading"><div className="rrp-loading-spinner" /><p>AI 분석 중...</p></div>}

        {result && (
          <div className="rrp-detail">
            <div className="rrp-detail-header" style={{ marginBottom: '16px' }}>
              <span className="rrp-detail-emoji">🍱</span>
              <div>
                <h2 className="rrp-detail-title">{result.recipe.title}</h2>
                <p className="rrp-detail-meta">작성자: {result.recipe.writerName || 'AI'}</p>
              </div>
            </div>

            <button className={`rrp-save-btn rrp-save-btn--${saveState}`} onClick={handleSaveRecipe} disabled={saveState !== 'idle'}>
              <span>{saveState === 'idle' ? '📖 레시피북 저장' : saveState === 'saving' ? '⏳ 저장 중' : '✅ 저장 완료'}</span>
            </button>

            <div className="rrp-section">
              <div className="rrp-section-title rrp-section-title--have">✅ 보유 중인 재료</div>
              <div className="rrp-tag-row">
                {result.have.map(i => <span key={i} className="rrp-tag rrp-tag--have">{i}</span>)}
              </div>
            </div>

            <div className="rrp-section">
              <div className="rrp-section-title rrp-section-title--missing">🛒 부족한 재료 (주변 시장)</div>
              <div className="rrp-missing-list">
                {result.missing.map(ing => (
                  <MissingIngredientCard key={ing} ingName={ing} marketItems={marketItems} onAddToCart={handleAddToCart} />
                ))}
              </div>
            </div>

            <div className="rrp-section">
              <div className="rrp-section-title">🍳 레시피 내용</div>
              <div className="rrp-recipe-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#444' }}>
                {result.recipe.content}
              </div>
            </div>
          </div>
        )}
      </div>
      {toast && <div className="rrp-toast">{toast}</div>}
    </div>
  );
}