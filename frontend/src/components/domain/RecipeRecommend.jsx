import React, { useState, useEffect } from 'react';
import '../../Styles/domain/RecipeRecommend.css';

// 임시 마켓 데이터 (실제로는 API에서 시장의 할인 품목을 받아옵니다)
const MOCK_MARKET_ITEMS = [
  { name: '햄', price: 3500, unit: '팩', saleStart: '18:00', saleEnd: '20:00', discountRate: 20 },
  { name: '두부', price: 1500, unit: '모', saleStart: '17:00', saleEnd: '19:00', discountRate: 30 },
  { name: '무', price: 2000, unit: '개', saleStart: '', saleEnd: '', discountRate: 0 },
  { name: '오일', price: 4500, unit: '병', saleStart: '19:00', saleEnd: '21:00', discountRate: 10 },
];

// 할인 상태 계산기: NONE | UPCOMING | ON_SALE 반환
const getSaleStatus = (item, now) => {
  if (!item || !item.saleStart || !item.saleEnd || !item.discountRate) return 'NONE';

  const [startH, startM] = item.saleStart.split(':').map(Number);
  const [endH,   endM]   = item.saleEnd.split(':').map(Number);

  const start = new Date(now);
  start.setHours(startH, startM, 0, 0);
  const end = new Date(now);
  end.setHours(endH, endM, 0, 0);
  const soon = new Date(start.getTime() - 60 * 60 * 1000); // 1시간 전을 임박으로 처리

  if (now >= start && now < end) return 'ON_SALE';
  if (now >= soon && now < start) return 'UPCOMING';
  return 'NONE';
};

/* ── 3. 없는 재료 버튼 UI (할인 색상 처리) ── */
const MissingIngredientButton = ({ missingName }) => {
  const [now, setNow] = useState(new Date());

  // 현재 시간을 기준으로 할인 상태를 실시간 업데이트
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);

  // 로컬 스토리지에서 상인 데이터 가져오기 (연동)
  const marketItems = JSON.parse(localStorage.getItem('marketItems') || '[]');
  const activeMarketItems = marketItems.length > 0 ? marketItems : MOCK_MARKET_ITEMS;

  const marketItem = activeMarketItems.find(m => missingName.includes(m.name) || m.name.includes(missingName));
  const status = getSaleStatus(marketItem, now);

  const displayPrice = status === 'ON_SALE' && marketItem
    ? Math.round(marketItem.price * (1 - marketItem.discountRate / 100))
    : marketItem?.price;

  return (
    <button 
      className={`missing-ing-btn status-${status.toLowerCase()}`} 
      onClick={() => {
        const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
        if (cart.some(item => item.name === missingName)) {
          alert(`'${missingName}'은(는) 이미 장바구니에 있습니다.`);
          return;
        }
        cart.push({
          id: Date.now() + Math.random(),
          name: missingName,
          price: displayPrice || 0,
          emoji: marketItem?.emoji || '🛒',
          desc: '레시피 부족 재료'
        });
        localStorage.setItem('cartItems', JSON.stringify(cart));
        alert(`'${missingName}'을(를) 마이페이지 장바구니에 담았습니다!`);
      }}
    >
      <div className="missing-ing-info">
        <span className="missing-ing-name">+{missingName}</span>
        {marketItem && <span className="missing-ing-price">{marketItem.shopName ? `[${marketItem.shopName}] ` : ''}{displayPrice.toLocaleString()}원</span>}
      </div>
      {status === 'ON_SALE' && <span className="sale-badge on-sale">🔴 {marketItem.discountRate}% 할인 중</span>}
      {status === 'UPCOMING' && <span className="sale-badge upcoming">⏰ 할인 임박</span>}
      {status === 'NONE' && marketItem && <span className="sale-badge none">정가 구매</span>}
      {!marketItem && <span className="sale-badge not-found">시장 정보 없음</span>}
    </button>
  );
};

/* ── 2. 레시피 상세 화면 ── */
const RecipeDetail = ({ recipe, onBack, onSave }) => {
  return (
    <div className="recipe-detail-view">
      <button className="back-btn" onClick={onBack}>← 목록으로</button>
      
      <div className="rd-header">
        <span className="rd-emoji">{recipe.emoji}</span>
        <div className="rd-title-wrap">
          <span className="rd-title">{recipe.name}</span>
          <span className="rd-meta">⏱ {recipe.time} · 난이도: {recipe.difficulty}</span>
        </div>
      </div>

      <div className="rd-section">
        <div className="rd-section-title">✅ 내 냉장고에 있는 재료</div>
        <div className="rd-tags">
          {(recipe.matched || []).map(ing => <span key={ing} className="tag have">{ing}</span>)}
        </div>
      </div>

      <div className="rd-section">
        <div className="rd-section-title">🛒 없는 재료 (시장 조회)</div>
        <div className="missing-ing-list">
          {(recipe.missing || []).map(ing => (
            <MissingIngredientButton key={ing} missingName={ing} />
          ))}
        </div>
      </div>

      <div className="rd-section">
        <div className="rd-section-title">📋 조리 순서</div>
        <div className="rd-step-list">
          {(recipe.steps || []).map((step, i) => (
            <div key={i} className="rd-step-item">
              <span className="rd-step-num">{i + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="rd-save-btn" onClick={() => onSave(recipe)}>이 레시피 마이페이지에 저장하기</button>
    </div>
  );
};

/* ── 1. 레시피 리스트 화면 ── */
const RecipeList = ({ recipes, onSelect }) => {
  return (
    <div className="recipe-list-view">
      <div className="recipe-list-desc">가진 재료로 만들 수 있는 추천 요리입니다.</div>
      <div className="recipe-cards">
        {recipes.map((r, i) => (
          <div key={i} className="recipe-card" onClick={() => onSelect(r)} style={{ cursor: 'pointer' }}>
            <div className="rc-top">
              <span className="rc-emoji">{r.emoji}</span>
              <div className="rc-info">
                <strong>{r.name}</strong>
                <span className="rc-meta">일치율: {r.matchRate}%</span>
              </div>
              <span className="rc-arrow">〉</span>
            </div>
            <div className="rc-tags">
              <span className="tag have">있는 재료 {r.matched?.length || 0}개</span>
              <span className="tag missing">부족한 재료 {r.missing?.length || 0}개</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── 메인 컨테이너 (모달 뼈대) ── */
export default function RecipeRecommendModal({ recipes, onClose, onSave }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 400 }}>
      <div className="ai-modal" onClick={e => e.stopPropagation()} style={{ background: '#f5ede0', border: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <span>{selectedRecipe ? '레시피 상세' : 'AI 레시피 추천'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {selectedRecipe ? (
            <RecipeDetail recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} onSave={onSave} />
          ) : (
            <RecipeList recipes={recipes} onSelect={setSelectedRecipe} />
          )}
        </div>
      </div>
    </div>
  );
}