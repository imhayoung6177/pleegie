import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/user/FridgePage.css';
import { getExpiryStatus } from '../../utils/dateUtils';

const CATEGORIES = [
  { id: 'veggie',  label: '🥬 채소'  },
  { id: 'meat',    label: '🥩 육류'  },
  { id: 'seafood', label: '🐟 해산물' },
  { id: 'dairy',   label: '🥛 유제품' },
  { id: 'grain',   label: '🌾 곡류'  },
  { id: 'sauce',   label: '🧂 양념'  },
];

const INGREDIENTS_BY_CAT = {
  veggie:  [
    { name: '양파',   emoji: '🧅' }, { name: '마늘',   emoji: '🧄' },
    { name: '당근',   emoji: '🥕' }, { name: '파',     emoji: '🌿' },
    { name: '감자',   emoji: '🥔' }, { name: '토마토', emoji: '🍅' },
    { name: '시금치', emoji: '🥬' }, { name: '고추',   emoji: '🌶️' },
    { name: '애호박', emoji: '🥒' }, { name: '버섯',   emoji: '🍄' },
  ],
  meat: [
    { name: '소고기',   emoji: '🥩' }, { name: '돼지고기', emoji: '🐷' },
    { name: '닭고기',   emoji: '🍗' }, { name: '계란',     emoji: '🥚' },
    { name: '베이컨',   emoji: '🥓' },
  ],
  seafood: [
    { name: '새우',   emoji: '🦐' }, { name: '오징어', emoji: '🦑' },
    { name: '연어',   emoji: '🐟' }, { name: '굴',     emoji: '🦪' },
    { name: '조개',   emoji: '🐚' },
  ],
  dairy: [
    { name: '우유',   emoji: '🥛' }, { name: '버터',   emoji: '🧈' },
    { name: '치즈',   emoji: '🧀' }, { name: '요거트', emoji: '🫙' },
    { name: '생크림', emoji: '🍶' },
  ],
  grain: [
    { name: '쌀',     emoji: '🌾' }, { name: '밀가루', emoji: '🫙' },
    { name: '파스타', emoji: '🍝' }, { name: '빵',     emoji: '🍞' },
  ],
  sauce: [
    { name: '간장',   emoji: '🍶' }, { name: '고추장', emoji: '🌶️' },
    { name: '된장',   emoji: '🫙' }, { name: '소금',   emoji: '🧂' },
    { name: '식용유', emoji: '🫙' }, { name: '설탕',   emoji: '🍬' },
  ],
};

const ALL_INGS = Object.values(INGREDIENTS_BY_CAT).flat();
const SHELF_SIZE = 12;
const UNITS = ['g', 'ml', '개', '컵', '큰술', '봉지', '적당량'];

/* ══════════════════════════════════════════════════════════
    수량 및 유통기한 편집 모달
══════════════════════════════════════════════════════════ */
const QtyModal = ({ item, onSave, onClose }) => {
  const [qty, setQty] = useState(item.qty ?? '');
  const [unit, setUnit] = useState(item.unit ?? 'g');
  const [expiryDate, setExpiryDate] = useState(item.expiryDate ?? '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="qty-modal" onClick={e => e.stopPropagation()}>
        <div className="qty-modal-top">
          <span className="qty-modal-emoji">{item.emoji}</span>
          <div className="qty-modal-name">{item.name}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="qty-modal-label">유통기한 설정</p>
        <div className="qty-input-row">
          <input className="date-input" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
        </div>
        <p className="qty-modal-label">보유 수량 입력</p>
        <div className="qty-input-row">
          <input className="qty-number-inp" type="number" min="0" placeholder="수량" value={qty} onChange={e => setQty(e.target.value)} />
          <select className="unit-select" value={unit} onChange={e => setUnit(e.target.value)}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="qty-btn-row">
          <button className="qty-cancel-btn" onClick={onClose}>취소</button>
          <button className="qty-save-btn" onClick={() => {
            onSave(item.dbId, qty === '' ? null : Number(qty), unit, expiryDate);
            onClose();
          }}>저장하기</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
    재료 추가 바텀시트 패널
══════════════════════════════════════════════════════════ */
const AddPanel = ({ myIngredients, onAdd, onRemove, onClose }) => {
  const [activeTab, setActiveTab] = useState('veggie');
  const [search, setSearch] = useState('');
  const [inputVal, setInputVal] = useState('');

  const searchTrimmed = search.trim();
  const displayList = searchTrimmed ? ALL_INGS.filter(i => i.name.includes(searchTrimmed)) : (INGREDIENTS_BY_CAT[activeTab] || []);
  const isInFridge = (name) => myIngredients.some(i => i.name === name);

  const handleChipClick = (ing) => {
    if (isInFridge(ing.name)) {
      const found = myIngredients.find(i => i.name === ing.name);
      onRemove(found.dbId);
    } else {
      onAdd({ ...ing, dbId: Date.now() + Math.random() });
    }
  };

  const handleDirectAdd = () => {
    const v = inputVal.trim();
    if (!v) return;
    if (!isInFridge(v)) onAdd({ name: v, emoji: '🍱', dbId: Date.now() + Math.random() });
    setInputVal('');
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="add-panel" onClick={e => e.stopPropagation()}>
        <div className="panel-handle" />
        <div className="panel-header"><h3 className="panel-title">재료 추가하기</h3><button className="panel-close-btn" onClick={onClose}>✕</button></div>
        <div className="search-wrap">🔍<input className="search-inp" type="text" placeholder="재료 검색" value={search} onChange={e => setSearch(e.target.value)} /></div>
        {!searchTrimmed && (
          <div className="cat-tabs">
            {CATEGORIES.map(cat => (
              <button key={cat.id} className={`cat-tab-btn ${activeTab === cat.id ? 'active' : ''}`} onClick={() => setActiveTab(cat.id)}>{cat.label}</button>
            ))}
          </div>
        )}
        <div className="ing-grid">
          {displayList.map(ing => (
            <div key={ing.name} className={`ing-chip ${isInFridge(ing.name) ? 'selected' : ''}`} onClick={() => handleChipClick(ing)}>
              <span className="chip-emoji">{ing.emoji}</span>
              <span className="chip-name">{ing.name}</span>
            </div>
          ))}
        </div>
        <div className="direct-wrap">
          <input className="direct-inp" type="text" placeholder="직접 입력" value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleDirectAdd()} />
          <button className="direct-btn" onClick={handleDirectAdd}>추가</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
    메인 냉장고 페이지
══════════════════════════════════════════════════════════ */
export default function FridgePage() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || '회원';

  const [items, setItems] = useState([
    { dbId: 1, name: '계란', emoji: '🥚', qty: 6, unit: '개', expiryDate: '2026-04-24' },
    { dbId: 2, name: '양파', emoji: '🧅', qty: 300, unit: 'g', expiryDate: '2026-05-10' },
    { dbId: 3, name: '간장', emoji: '🍶', qty: null, unit: 'ml', expiryDate: '2026-04-10' },
  ]);

  const [addOpen, setAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleAdd = (ing) => setItems(prev => prev.some(i => i.name === ing.name) ? prev : [...prev, { ...ing, dbId: ing.dbId || Date.now(), qty: null, unit: 'g', expiryDate: '' }]);
  const handleRemove = (dbId) => setItems(prev => prev.filter(i => i.dbId !== dbId));
  const handleUpdateQty = (dbId, qty, unit, expiryDate) => setItems(prev => prev.map(i => i.dbId === dbId ? { ...i, qty, unit, expiryDate } : i));

  // ✅ 로그아웃 기능
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // ✅ 1. 레시피 추천 페이지로 이동
  const handleGoToRecipe = () => {
    localStorage.setItem('fridgeItems', JSON.stringify(items));
    navigate('/user/recipe-recommend');
  };

  // ✅ 2. 음식 검색 페이지로 이동
  const handleGoToFoodSearch = () => {
    localStorage.setItem('fridgeItems', JSON.stringify(items));
    navigate('/user/food-search');
  };

  const shelves = [];
  for (let i = 0; i < items.length; i += SHELF_SIZE) { shelves.push(items.slice(i, i + SHELF_SIZE)); }

  return (
    <div className="fridge-page">
      <div className="page-header">
        <h1 className="page-title">pleegie</h1>
        <div className="header-actions">
          <button className="header-user-btn" onClick={() => navigate('/user/mypage')}>
            <span className="header-user-emoji">👤</span>
            <span className="header-user-name">{userName}님</span>
          </button>
          <button className="header-logout-btn" onClick={handleLogout}>로그아웃</button>
        </div>
      </div>
      <div className="fridge-outer">
        <div className="fridge-top-panel">
          <span className="fridge-brand">{userName}님의 냉장고</span>
        </div>
        <div className="fridge-ai-bar">
          <button className="ai-btn ai-btn-orange" onClick={handleGoToRecipe}><strong>내 재료로 레시피 추천</strong></button>
          <button className="ai-btn ai-btn-orange" onClick={handleGoToFoodSearch}><strong>먹고 싶은 음식 찾기</strong></button>
        </div>
        <div className="fridge-divider" />
        <div className="fridge-interior">
          <div className="fridge-ceiling-light" />
          {items.length === 0 ? <div className="fridge-empty">냉장고가 비어있습니다. 재료를 추가해주세요.</div> : shelves.map((shelf, si) => (
            <div key={si} className="fridge-shelf-section">
              <div className="items-grid">
                {shelf.map((item, idx) => {
                  const status = getExpiryStatus(item.expiryDate);
                  return (
                    <div key={item.dbId} className={`fridge-item ${status}`} onClick={() => setSelectedItem(item)}>
                      {status === 'urgent' && <div className="urgent-tag">임박</div>}
                      {status === 'expired' && <div className="expired-tag">만료</div>}
                      <button className="remove-btn" onClick={e => { e.stopPropagation(); handleRemove(item.dbId); }}>✕</button>
                      <span className="item-emoji">{item.emoji}</span>
                      <span className="item-name">{item.name}</span>
                      <span className="qty-badge">{item.qty ? `${item.qty}${item.unit}` : '미설정'}</span>
                    </div>
                  );
                })}
                {si === shelves.length - 1 && <div className="fridge-add-card" onClick={() => setAddOpen(true)}>＋ 추가</div>}
              </div>
              <div className="shelf-glass" />
            </div>
          ))}
        </div>
        <div className="fridge-bottom">
          <span className="item-count">재료 {items.length}개 보관 중</span>
<button 
  className="add-btn" 
  onClick={() => navigate('/user/chatbot')} // ✅ alert 대신 navigate로 변경!
>
            <span></span>
            <span className="add-btn-label">AI 챗봇</span>
</button>        </div>
      </div>
      {selectedItem && <QtyModal item={selectedItem} onSave={handleUpdateQty} onClose={() => setSelectedItem(null)} />}
      {addOpen && <AddPanel myIngredients={items} onAdd={handleAdd} onRemove={handleRemove} onClose={() => setAddOpen(false)} />}
    </div>
  );
}