import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/user/FridgePage.css';

const SHELF_SIZE = 12;
const UNITS = ['g', 'ml', '개', '컵', '큰술', '봉지', '적당량'];

const getTodayStr = (daysToAdd = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
};

/* ══════════════════════════════════════════════════════════
   수량/유통기한 수정 모달
══════════════════════════════════════════════════════════ */
const QtyModal = ({ item, onSave, onClose }) => {
  const [qty,        setQty]        = useState(item.quantity ?? '');
  const [unit,       setUnit]       = useState(item.unit ?? '개');
  const [expiryDate, setExpiryDate] = useState(item.exp ?? '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="qty-modal" onClick={e => e.stopPropagation()}>
        <div className="qty-modal-top">
          <span className="qty-modal-emoji">🍱</span>
          <div className="qty-modal-name">{item.name}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="qty-modal-label">유통기한 설정</p>
        <div className="qty-input-row">
          <input
            className="date-input"
            type="date"
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
          />
        </div>
        <p className="qty-modal-label">보유 수량 입력</p>
        <div className="qty-input-row">
          <input
            className="qty-number-inp"
            type="number"
            step="0.1"
            value={qty}
            onChange={e => setQty(e.target.value)}
          />
          <select
            className="unit-select"
            value={unit}
            onChange={e => setUnit(e.target.value)}
          >
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="qty-btn-row">
          <button className="qty-cancel-btn" onClick={onClose}>취소</button>
          <button
            className="qty-save-btn"
            onClick={() => {
              onSave(item.id, qty === '' ? null : parseFloat(qty), unit, expiryDate);
              onClose();
            }}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   재료 추가 패널
══════════════════════════════════════════════════════════ */
const AddPanel = ({ myIngredients, masterList, onAdd, onManualAdd, onRemove, onClose }) => {
  const [search, setSearch] = useState('');

  // ✅ masterList가 비어있으면 검색어 기반으로만 표시
  const displayList = search.trim()
    ? masterList.filter(i => i.name.includes(search.trim()))
    : masterList;

  const isInFridge = (name) => myIngredients.some(i => i.name === name);

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="add-panel" onClick={e => e.stopPropagation()}>
        <div className="panel-handle" />
        <div className="panel-header">
          <h3 className="panel-title">재료 추가하기</h3>
          <button className="panel-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="search-wrap">
          🔍
          <input
            className="search-inp"
            type="text"
            placeholder="재료 검색 또는 직접 입력"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="ing-grid">
          {displayList.length > 0 ? (
            displayList.map(ing => (
              <div
                key={ing.id}
                className={`ing-chip ${isInFridge(ing.name) ? 'selected' : ''}`}
                onClick={() =>
                  isInFridge(ing.name)
                    ? onRemove(myIngredients.find(i => i.name === ing.name).id)
                    : onAdd(ing)
                }
              >
                <span className="chip-emoji">🍱</span>
                <span className="chip-name">{ing.name}</span>
              </div>
            ))
          ) : (
            <div
              className="no-item-msg"
              style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: '#718096' }}
            >
              {/* ✅ [수정] masterList 비어있을 때 안내 메시지 개선 */}
              {search.trim()
                ? '검색 결과가 없습니다.'
                : '재료 이름을 검색하거나 직접 입력해주세요'}
            </div>
          )}

          {/* ✅ 직접 입력 버튼 - masterList에 없거나 검색어가 있을 때 표시 */}
          {search.trim() !== '' && !masterList.some(i => i.name === search.trim()) && (
            <div
              className="ing-chip manual-add-chip"
              onClick={() => { onManualAdd(search.trim()); setSearch(''); }}
            >
              <span className="chip-emoji">➕</span>
              <span className="chip-name">"{search}" 직접 추가</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   메인 냉장고 페이지
══════════════════════════════════════════════════════════ */
export default function FridgePage() {
  const navigate  = useNavigate();
  const userName  = localStorage.getItem('userName') || '회원';

  const [items,        setItems]        = useState([]);
  const [masterList,   setMasterList]   = useState([]);
  const [addOpen,      setAddOpen]      = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ 1. 냉장고 재료 조회 → GET /user/fridge/items (Spring)
        const fridgeRes  = await fetch('/user/fridge/items', { headers: getAuthHeaders() });
        const fridgeJson = await fridgeRes.json();
        if (fridgeRes.ok) setItems(fridgeJson.data || fridgeJson);

        // ✅ 2. [수정] ItemMaster 목록 조회
        // → 이전: /api/items/master (없는 경로! 500 에러)
        // → 이후: Python /api/ingredients/info 또는 Spring ItemMaster API
        //
        // 현재 백엔드에 ItemMasterController 가 없으므로
        // Python의 재료 정보 API를 활용하거나
        // masterList 를 빈 배열로 두고 직접 입력만 허용
        //
        // ✅ Python /api/ingredients 는 추출/정보 조회용이라 목록 조회가 없음
        // → 따라서 masterList 는 일단 비워두고 직접 입력 방식 사용
        // → 백엔드에 GET /api/items/master 가 생기면 아래 주석 해제
        //
        // const masterRes  = await fetch('/api/items/master', { headers: getAuthHeaders() });
        // const masterJson = await masterRes.json();
        // if (masterRes.ok) setMasterList(masterJson.data || masterJson);

        // ✅ [임시] 자주 쓰는 재료 기본 목록 (백엔드 API 생기면 제거)
        setMasterList([
          { id: 1,  name: '계란',   category: '단백질', unit: '개' },
          { id: 2,  name: '두부',   category: '단백질', unit: '모' },
          { id: 3,  name: '당근',   category: '채소',   unit: '개' },
          { id: 4,  name: '양파',   category: '채소',   unit: '개' },
          { id: 5,  name: '대파',   category: '채소',   unit: '봉지' },
          { id: 6,  name: '감자',   category: '채소',   unit: '개' },
          { id: 7,  name: '시금치', category: '채소',   unit: '봉지' },
          { id: 8,  name: '돼지고기', category: '육류', unit: 'g' },
          { id: 9,  name: '소고기', category: '육류',   unit: 'g' },
          { id: 10, name: '닭고기', category: '육류',   unit: 'g' },
          { id: 11, name: '우유',   category: '유제품', unit: 'ml' },
          { id: 12, name: '된장',   category: '양념',   unit: 'g' },
          { id: 13, name: '간장',   category: '양념',   unit: 'ml' },
          { id: 14, name: '고추장', category: '양념',   unit: 'g' },
          { id: 15, name: '마늘',   category: '채소',   unit: '개' },
          { id: 16, name: '애호박', category: '채소',   unit: '개' },
          { id: 17, name: '김치',   category: '기타',   unit: 'g' },
          { id: 18, name: '두유',   category: '유제품', unit: 'ml' },
          { id: 19, name: '쌀',     category: '곡물',   unit: 'g' },
          { id: 20, name: '파스타', category: '곡물',   unit: 'g' },
        ]);

      } catch (err) {
        console.error('데이터 로드 실패:', err);
      }
    };
    fetchData();
  }, []);

  // ✅ ItemMaster 기반 재료 추가
  // → FridgeItemCreateRequest: { itemMasterId, category, quantity, unit, exp }
  const handleAdd = async (ing) => {
    try {
      const response = await fetch('/user/fridge/items', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          itemMasterId: Number(ing.id),
          category:     ing.category,
          quantity:     1.0,
          unit:         ing.unit || '개',
          exp:          getTodayStr(7),
        }),
      });
      const result = await response.json();
      if (response.ok) setItems(prev => [...prev, result.data || result]);
    } catch (err) {
      console.error('재료 추가 실패:', err);
    }
  };

  // ✅ [수정] 직접 입력 재료 추가
  // → /user/fridge/items/manual 경로가 없을 수 있으므로
  //   itemMasterId 없이 name만으로 추가하는 방식
  // → 백엔드에 해당 엔드포인트가 없으면 아래처럼 안내
  const handleManualAdd = async (itemName) => {
    try {
      const response = await fetch('/user/fridge/items/manual', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name:     itemName,
          category: 'etc',
          quantity: 1.0,
          unit:     '개',
          exp:      getTodayStr(7),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setItems(prev => [...prev, result.data || result]);
        alert(`"${itemName}" 추가 완료!`);
      } else {
        // ✅ manual 엔드포인트 없을 시 안내
        alert('직접 입력 기능은 아직 준비 중이에요.\n목록에서 재료를 선택해주세요!');
      }
    } catch (err) {
      console.error('직접 추가 실패:', err);
      alert('직접 입력 기능은 아직 준비 중이에요.\n목록에서 재료를 선택해주세요!');
    }
  };

  // ✅ 재료 삭제 → DELETE /user/fridge/items/{itemId}
  const handleRemove = async (itemId) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`/user/fridge/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error('재료 삭제 실패:', err);
    }
  };

  // ✅ 수량/유통기한 수정 → PUT /user/fridge/items/{itemId}
  const handleUpdateQty = async (itemId, quantity, unit, exp) => {
    try {
      const response = await fetch(`/user/fridge/items/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          quantity: parseFloat(quantity),
          unit,
          exp:      exp || null,
          category: items.find(i => i.id === itemId)?.category,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setItems(prev => prev.map(i => i.id === itemId ? (result.data || result) : i));
      }
    } catch (err) {
      console.error('수량 수정 실패:', err);
    }
  };

  // 선반 단위로 나누기
  const shelves = [];
  for (let i = 0; i < items.length; i += SHELF_SIZE) {
    shelves.push(items.slice(i, i + SHELF_SIZE));
  }

  return (
    <div className="fridge-page">
      {/* 헤더 */}
      <div className="page-header">
        <h1
          className="page-title"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          pleegie
        </h1>
        <div className="header-actions">
          <div
            className="header-user-name"
            onClick={() => navigate('/user/mypage')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            👤 <span style={{ marginLeft: '4px', textDecoration: 'underline' }}>{userName}님</span>
          </div>
          <button
            className="header-logout-btn"
            onClick={() => { localStorage.clear(); navigate('/'); }}
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="fridge-outer">
        <div className="fridge-top-panel">
          <span className="fridge-brand">{userName}님의 Smart Fridge</span>
        </div>

        <div className="fridge-ai-bar">
          <button className="ai-btn" onClick={() => navigate('/user/recipe-recommend')}>
            레시피 추천
          </button>
          <button className="ai-btn" onClick={() => navigate('/user/food-search')}>
            음식 찾기
          </button>
        </div>

        <div className="fridge-divider" />

        <div className="fridge-interior">
          <div className="fridge-light" />

          {items.length === 0 ? (
            <div className="fridge-shelf-section empty-fridge">
              <div className="fridge-add-card" onClick={() => setAddOpen(true)}>
                ＋ 재료 추가
              </div>
            </div>
          ) : (
            shelves.map((shelf, si) => (
              <div key={si} className="fridge-shelf-section">
                <div className="items-grid">
                  {shelf.map(item => (
                    <div
                      key={item.id}
                      className={`fridge-item ${item.status?.toLowerCase()}`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <button
                        className="remove-btn"
                        onClick={e => { e.stopPropagation(); handleRemove(item.id); }}
                      >
                        ✕
                      </button>
                      <span className="item-emoji">🍱</span>
                      <span className="item-name">{item.name}</span>
                      <span className="qty-badge">{item.quantity}{item.unit}</span>
                    </div>
                  ))}
                  {si === shelves.length - 1 && (
                    <div className="fridge-add-card" onClick={() => setAddOpen(true)}>
                      ＋ 추가
                    </div>
                  )}
                </div>
                <div className="shelf-glass" />
              </div>
            ))
          )}
        </div>

        <div className="fridge-bottom">
          <span className="item-count">재료 {items.length}개 보관 중</span>
          <button
            className="chatbot-btn"
            onClick={() => navigate('/user/chatbot')}
          >
            AI 챗봇
          </button>
        </div>
      </div>

      {selectedItem && (
        <QtyModal
          item={selectedItem}
          onSave={handleUpdateQty}
          onClose={() => setSelectedItem(null)}
        />
      )}
      {addOpen && (
        <AddPanel
          myIngredients={items}
          masterList={masterList}
          onAdd={handleAdd}
          onManualAdd={handleManualAdd}
          onRemove={handleRemove}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}