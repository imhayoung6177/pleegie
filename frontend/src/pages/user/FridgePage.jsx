import React, { useState } from 'react';
import '../../Styles/user/FridgePage.css';
import { getExpiryStatus } from '../../utils/dateUtils';

/* ══════════════════════════════════════════════════════════
    데이터 상수
══════════════════════════════════════════════════════════ */
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
const SHELF_SIZE = 5;
const UNITS = ['g', 'ml', '개', '컵', '큰술', '봉지', '적당량'];

const MOCK_RECIPES = [
  { id: 101, emoji: '🍳', name: '계란볶음밥',  time: '15분', difficulty: '쉬움', matchRate: 95,
    matched: ['계란', '쌀', '간장', '파'], missing: ['햄'],
    ingredients: ['계란 2개', '밥 1공기', '간장 1큰술', '파 약간', '참기름'],
    steps: ['파를 잘게 썰어 준비합니다.', '달궈진 팬에 기름을 두르고 계란을 스크램블합니다.', '밥을 넣고 강불에서 볶아줍니다.', '간장, 참기름을 넣고 마지막에 파를 올려 완성합니다.'] },
  { id: 102, emoji: '🥘', name: '된장찌개',    time: '20분', difficulty: '쉬움', matchRate: 88,
    matched: ['된장', '애호박', '양파'], missing: ['두부'],
    ingredients: ['된장 2큰술', '두부 1/2모', '애호박 1/4개', '양파 1/4개', '멸치육수 2컵'],
    steps: ['멸치육수를 냄비에 넣고 끓입니다.', '된장을 풀어 넣습니다.', '두부, 애호박, 양파를 넣고 10분 끓입니다.', '기호에 따라 청양고추를 넣어 완성합니다.'] },
  { id: 103, emoji: '🍜', name: '소고기무국',  time: '30분', difficulty: '보통', matchRate: 75,
    matched: ['소고기', '간장', '마늘'], missing: ['무'],
    ingredients: ['소고기 150g', '무 200g', '간장 2큰술', '마늘 1큰술', '참기름', '물 4컵'],
    steps: ['소고기를 참기름에 볶아줍니다.', '무를 나박썰기하여 넣고 함께 볶습니다.', '물을 붓고 20분간 끓입니다.', '간장과 소금으로 간을 맞춰 완성합니다.'] },
];

/* ══════════════════════════════════════════════════════════
    수량 및 유통기한 편집 모달
══════════════════════════════════════════════════════════ */
const QtyModal = ({ item, onSave, onClose }) => {
  const [qty, setQty] = useState(item.qty ?? '');
  const [unit, setUnit] = useState(item.unit ?? 'g');
  // [추가] 유통기한 설정을 위한 상태값 (기존 값이 있으면 가져오고 없으면 빈 문자열)
  const [expiryDate, setExpiryDate] = useState(item.expiryDate ?? '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="qty-modal" onClick={e => e.stopPropagation()}>
        <div className="qty-modal-top">
          <span className="qty-modal-emoji">{item.emoji}</span>
          <div className="qty-modal-name">{item.name}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* [추가] 유통기한 입력 섹션 */}
        <p className="qty-modal-label">유통기한 설정</p>
        <div className="qty-input-row">
          <input 
            className="date-input" 
            type="date" 
            value={expiryDate} 
            onChange={(e) => setExpiryDate(e.target.value)} 
          />
        </div>

        <p className="qty-modal-label">보유 수량 입력</p>
        <div className="qty-input-row">
          <input className="qty-number-inp" type="number" min="0" placeholder="수량"
            value={qty} onChange={e => setQty(e.target.value)} />
          <select className="unit-select" value={unit} onChange={e => setUnit(e.target.value)}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="qty-btn-row">
          <button className="qty-cancel-btn" onClick={onClose}>취소</button>
          <button className="qty-save-btn" onClick={() => {
            // [수정] 저장 시 expiryDate도 함께 부모(FridgePage)로 전달
            onSave(item.dbId, qty === '' ? null : Number(qty), unit, expiryDate);
            onClose();
          }}>저장하기</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
    재료 추가 바텀시트 패널 (일반 코드는 이전과 동일)
══════════════════════════════════════════════════════════ */
const AddPanel = ({ myIngredients, onAdd, onRemove, onClose }) => {
  const [activeTab, setActiveTab] = useState('veggie');
  const [search, setSearch] = useState('');
  const [inputVal, setInputVal] = useState('');

  const searchTrimmed = search.trim();
  const displayList = searchTrimmed
    ? ALL_INGS.filter(i => i.name.includes(searchTrimmed))
    : (INGREDIENTS_BY_CAT[activeTab] || []);

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
        <div className="panel-header">
          <h3 className="panel-title">재료 추가하기</h3>
          <button className="panel-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-inp" type="text"
            placeholder="재료 검색 (예: 당근, 소고기...)"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        {!searchTrimmed && (
          <div className="cat-tabs">
            {CATEGORIES.map(cat => {
              const cnt = myIngredients.filter(mi =>
                (INGREDIENTS_BY_CAT[cat.id] || []).some(i => i.name === mi.name)
              ).length;
              return (
                <button key={cat.id}
                  className={`cat-tab-btn ${activeTab === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(cat.id)}>
                  {cat.label}
                  {cnt > 0 && <span className="tab-badge">{cnt}</span>}
                </button>
              );
            })}
          </div>
        )}
        <div className="ing-grid">
          {displayList.length === 0 ? (
            <p className="grid-empty">검색 결과가 없어요 😅<br />아래에서 직접 입력해보세요!</p>
          ) : displayList.map(ing => {
            const selected = isInFridge(ing.name);
            return (
              <div key={ing.name}
                className={`ing-chip ${selected ? 'selected' : ''}`}
                onClick={() => handleChipClick(ing)}>
                <span className="chip-emoji">{ing.emoji}</span>
                <span className="chip-name">{ing.name}</span>
                {selected && <span className="chip-check">✓</span>}
              </div>
            );
          })}
        </div>
        <div className="direct-wrap">
          <input className="direct-inp" type="text"
            placeholder="직접 입력 후 Enter (예: 새송이버섯)"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleDirectAdd()} />
          <button className="direct-btn" onClick={handleDirectAdd}>추가</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
    AI 레시피 추천, 음식 검색, 상세 보기 모달
══════════════════════════════════════════════════════════ */
const RecipeModal = ({ myIngredients, onClose, onSelectRecipe }) => {
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  React.useEffect(() => {
    const t = setTimeout(() => { setRecipes(MOCK_RECIPES); setLoading(false); }, 1500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ai-modal green-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><span>AI 레시피 추천</span><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {loading ? ( <div className="loading-wrap"><div className="loading-ring green-ring" /><p>분석 중...</p></div> ) : (
            <div className="recipe-cards">
              {recipes.map((r, i) => (
                <div key={i} className="recipe-card" onClick={() => onSelectRecipe(r)} style={{ cursor: 'pointer' }}>
                  <div className="rc-top"><span className="rc-emoji">{r.emoji}</span><strong>{r.name}</strong></div>
                  <div className="rc-tags">
                    {r.matched.map(m => <span key={m} className="tag have">{m}</span>)}
                    {r.missing && r.missing.map(m => <span key={m} className="tag missing" onClick={(e) => handleAddToCart(m, e)} style={{cursor: 'pointer'}} title="장바구니 담기">+{m} 🛒</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 장바구니 담기 공통 함수
const handleAddToCart = (ingName, e) => {
  if (e) e.stopPropagation();
  const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
  if (cart.some(item => item.name === ingName)) {
    alert(`'${ingName}'은(는) 이미 장바구니에 있습니다.`);
    return;
  }
  cart.push({
    id: Date.now() + Math.random(),
    name: ingName,
    price: Math.floor(Math.random() * 3000) + 1000,
    emoji: '🛒',
    desc: '부족한 재료'
  });
  localStorage.setItem('cartItems', JSON.stringify(cart));
  alert(`'${ingName}'을(를) 장바구니에 담았습니다!\n마이페이지에서 확인 및 구매가 가능합니다.`);
};

const FoodSearchModal = ({ myIngredients, onClose, onSelectRecipe }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      // 상인이 등록한 상품과 연동
      const marketItems = JSON.parse(localStorage.getItem('marketItems') || '[]');
      const missingIngredients = ['오일', '돼지고기']; // 데모용 부족 재료
      
      const matchedMarkets = marketItems
        .filter(m => missingIngredients.some(miss => m.name.includes(miss) || miss.includes(m.name)))
        .map(m => ({
          name: m.shopName || '동네 시장',
          distance: '가까움',
          address: '도보 5분',
          specialty: `${m.emoji} ${m.name} ${m.discountRate ? `(${m.discountRate}% 할인)` : ''}`
        }));

      setResult({ 
        recipe: { id: Date.now(), emoji: '🍝', name: query, time: '25분', difficulty: '보통',
                  ingredients: ['파스타 200g', '돼지고기 100g', '올리브오일'], steps: ['파스타를 삶습니다.', '돼지고기를 볶습니다.', '면과 볶습니다.'] }, 
        have: myIngredients.slice(0, 2).map(i => i.name), 
        missing: missingIngredients, 
        markets: matchedMarkets 
      });
      setLoading(false);
    }, 1500);
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ai-modal orange-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><span>음식 찾기</span><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="search-row">
            <input className="food-inp" type="text" placeholder="먹고 싶은 음식 (예: 파스타)" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button className="food-search-btn" onClick={handleSearch} disabled={loading}>{loading ? '...' : '검색'}</button>
          </div>
          {loading && <div className="loading-wrap"><div className="loading-ring orange-ring" /><p>분석 중...</p></div>}
          {result && (
            <div className="food-result">
              <div className="result-title" onClick={() => onSelectRecipe(result.recipe)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                {result.recipe.emoji} {result.recipe.name} <span className="rc-meta">상세 보기 〉</span>
              </div>
              <p className="section-label have-label">✅ 있는 재료</p>
              <div className="tag-row">{result.have.map(i => <span key={i} className="tag have">{i}</span>)}</div>
              <p className="section-label missing-label">🛒 없는 재료 (클릭해서 장바구니 담기)</p>
              <div className="tag-row">{result.missing.map(i => <span key={i} className="tag missing" onClick={(e) => handleAddToCart(i, e)} style={{cursor: 'pointer'}} title="장바구니 담기">{i} 🛒</span>)}</div>
              
              {result.markets && result.markets.length > 0 && <>
                <p className="section-label market-label">🏪 재료를 파는 주변 시장</p>
                {result.markets.map((m, i) => (
                  <div key={i} className="market-card">
                    <strong>{m.name}</strong>
                    <span>{m.distance} · {m.address}</span>
                    <span className="market-spec">{m.specialty}</span>
                  </div>
                ))}
              </>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RecipeDetailModal = ({ recipe, onClose, onSave }) => {
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 400 }}>
      <div className="ai-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span>AI 레시피 요약</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body rd-content">
          <div className="rd-header">
            <span className="rd-emoji">{recipe.emoji}</span>
            <div className="rd-title-wrap">
              <span className="rd-title">{recipe.name}</span>
              <span className="rd-meta">⏱ {recipe.time || '15분'} · 난이도: {recipe.difficulty || '쉬움'}</span>
            </div>
          </div>
          <div className="rd-section-title">🥬 필요 재료</div>
          <div className="rd-ing-list">
            {(recipe.ingredients || []).map((ing, i) => <span key={i} className="rd-ing-item">{ing}</span>)}
          </div>
          <div className="rd-section-title">📋 조리 순서</div>
          <div className="rd-step-list">
            {(recipe.steps || []).map((step, i) => (
              <div key={i} className="rd-step-item"><span className="rd-step-num">{i + 1}.</span><span>{step}</span></div>
            ))}
          </div>
          <button className="rd-save-btn" onClick={() => onSave(recipe)}>이 레시피 마이페이지에 저장하기</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
    메인 냉장고 페이지
══════════════════════════════════════════════════════════ */
export default function FridgePage() {
  const userName = localStorage.getItem('userName') || '회원';

  // [수정] 초기 데이터에 expiryDate 추가 (테스트용)
  const [items, setItems] = useState([
    { dbId: 1, name: '계란',   emoji: '🥚', qty: 6,    unit: '개', expiryDate: '2026-04-24' },
    { dbId: 2, name: '양파',   emoji: '🧅', qty: 300,  unit: 'g',  expiryDate: '2026-05-10' },
    { dbId: 3, name: '간장',   emoji: '🍶', qty: null, unit: 'ml', expiryDate: '2026-04-10' },
    { dbId: 4, name: '된장',   emoji: '🫙', qty: null, unit: 'g',  expiryDate: '2026-12-31' },
    { dbId: 5, name: '파',     emoji: '🌿', qty: null, unit: 'g',  expiryDate: '2026-04-26' },
  ]);

  const [addOpen,      setAddOpen]      = useState(false);
  const [recipeOpen,   setRecipeOpen]   = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null); // 레시피 상세 모달 상태

  const handleAdd = (ing) => {
    setItems(prev => {
      if (prev.some(i => i.name === ing.name)) return prev;
      return [...prev, { dbId: ing.dbId || Date.now(), name: ing.name, emoji: ing.emoji, qty: null, unit: 'g', expiryDate: '' }];
    });
  };

  const handleRemove = (dbId) => setItems(prev => prev.filter(i => i.dbId !== dbId));

  // [수정] expiryDate 인자를 추가로 받아 상태 업데이트
  const handleUpdateQty = (dbId, qty, unit, expiryDate) =>
    setItems(prev => prev.map(i => i.dbId === dbId ? { ...i, qty, unit, expiryDate } : i));

  // 레시피 북에 저장 로직 (로컬 스토리지)
  const handleSaveRecipe = (recipe) => {
    const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    // 이미 있는지 확인
    if (!saved.some(r => r.id === recipe.id)) {
      saved.push(recipe);
      localStorage.setItem('savedRecipes', JSON.stringify(saved));
      alert(`'${recipe.name}' 레시피가 마이페이지의 레시피 북에 저장되었습니다!`);
    } else {
      alert('이미 저장된 레시피입니다.');
    }
  };

  const shelves = [];
  for (let i = 0; i < items.length; i += SHELF_SIZE) {
    shelves.push(items.slice(i, i + SHELF_SIZE));
  }

  return (
    <div className="fridge-page">
      <h1 className="page-title">pleege</h1>
      <div className="fridge-outer">
        <div className="fridge-top-panel">
          <span className="fridge-brand">나의 냉장고</span>
          <div className="fridge-led" />
          <button className="header-user-btn" onClick={() => window.location.href = '/user/mypage'}>
            <span className="header-user-emoji">👤</span>
            <span className="header-user-name">{userName}님</span>
          </button>
        </div>
        <div className="fridge-ai-bar">
          <button className="ai-btn ai-btn-green" onClick={() => setRecipeOpen(true)}>
            <span className="ai-btn-text"><strong>내 재료로 레시피 추천</strong></span>
          </button>
          <button className="ai-btn ai-btn-orange" onClick={() => setSearchOpen(true)}>
            <span className="ai-btn-text ai-btn-text--right"><strong>먹고 싶은 음식 찾기</strong></span>
          </button>
        </div>
        <div className="fridge-divider" />
        <div className="fridge-interior">
          <div className="fridge-ceiling-light" />
          {items.length === 0 ? (
            <div className="fridge-empty"><span className="empty-icon">🧊</span><p className="empty-title">비어있어요</p></div>
          ) : (
            <>
              {shelves.map((shelf, si) => (
                <div key={si} className="fridge-shelf-section">
                  <div className="items-grid">
                    {shelf.map((item, idx) => {
                      // [추가] 렌더링 시 유통기한 상태 계산
                      const status = getExpiryStatus(item.expiryDate);
                      return (
                        <div key={item.dbId}
                          className={`fridge-item ${status}`} // [추가] 상태 클래스 (urgent, expired) 적용
                          style={{ animationDelay: `${(si * SHELF_SIZE + idx) * 0.05}s` }}
                          onClick={() => setSelectedItem(item)}>
                          
                          {/* [추가] 상태별 배지 노출 */}
                          {status === 'urgent' && <div className="urgent-tag">임박</div>}
                          {status === 'expired' && <div className="expired-tag">만료</div>}
                          
                          <button className="remove-btn" onClick={e => { e.stopPropagation(); handleRemove(item.dbId); }}>✕</button>
                          <span className="item-emoji">{item.emoji}</span>
                          <span className="item-name">{item.name}</span>
                          {item.qty !== null ? <span className="qty-badge">{item.qty}{item.unit}</span> : <span className="qty-badge qty-badge--empty">수량 미설정</span>}
                        </div>
                      );
                    })}
                    {si === shelves.length - 1 && (
                      <div className="fridge-add-card" onClick={() => setAddOpen(true)}><span className="add-card-plus">＋</span><span className="add-card-text">재료 추가</span></div>
                    )}
                  </div>
                  <div className="shelf-glass" />
                </div>
              ))}
            </>
          )}
        </div>
        <div className="fridge-bottom">
          <span className="item-count">재료 {items.length}개 보관 중</span>
          <button className="add-btn" onClick={() => alert('AI 챗봇 준비 중!')}><span>💬</span><span className="add-btn-label">AI 챗봇</span></button>
        </div>
      </div>
      {selectedItem && <QtyModal item={selectedItem} onSave={handleUpdateQty} onClose={() => setSelectedItem(null)} />}
      {addOpen && <AddPanel myIngredients={items} onAdd={handleAdd} onRemove={handleRemove} onClose={() => setAddOpen(false)} />}
      {recipeOpen && <RecipeModal myIngredients={items} onClose={() => setRecipeOpen(false)} onSelectRecipe={setSelectedRecipeDetail} />}
      {searchOpen && <FoodSearchModal myIngredients={items} onClose={() => setSearchOpen(false)} onSelectRecipe={setSelectedRecipeDetail} />}
      {selectedRecipeDetail && <RecipeDetailModal recipe={selectedRecipeDetail} onClose={() => setSelectedRecipeDetail(null)} onSave={handleSaveRecipe} />}
    </div>
  );
}