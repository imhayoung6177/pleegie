import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/user/FridgePage.css';

const SHELF_SIZE = 12;
const UNITS = ['g', 'ml', '개', '컵', '큰술', '봉지', '적당량'];

// 오늘 날짜 기준으로 daysToAdd 일 후 날짜를 "YYYY-MM-DD" 형식으로 반환
const getTodayStr = (daysToAdd = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
};

// ✅ 임시 masterList
// → DB item_master 테이블에 데이터가 없을 때 사용
// → DB에 INSERT 후 /item-master API가 데이터를 반환하면 자동으로 서버 데이터로 교체됨
const FALLBACK_MASTER_LIST = [
  { id: 1,  name: '계란',     category: '단백질', unit: '개' },
  { id: 2,  name: '두부',     category: '단백질', unit: '모' },
  { id: 3,  name: '당근',     category: '채소',   unit: '개' },
  { id: 4,  name: '양파',     category: '채소',   unit: '개' },
  { id: 5,  name: '대파',     category: '채소',   unit: '봉지' },
  { id: 6,  name: '감자',     category: '채소',   unit: '개' },
  { id: 7,  name: '시금치',   category: '채소',   unit: '봉지' },
  { id: 8,  name: '돼지고기', category: '육류',   unit: 'g' },
  { id: 9,  name: '소고기',   category: '육류',   unit: 'g' },
  { id: 10, name: '닭고기',   category: '육류',   unit: 'g' },
  { id: 11, name: '우유',     category: '유제품', unit: 'ml' },
  { id: 12, name: '된장',     category: '양념',   unit: 'g' },
  { id: 13, name: '간장',     category: '양념',   unit: 'ml' },
  { id: 14, name: '고추장',   category: '양념',   unit: 'g' },
  { id: 15, name: '마늘',     category: '채소',   unit: '개' },
  { id: 16, name: '애호박',   category: '채소',   unit: '개' },
  { id: 17, name: '김치',     category: '기타',   unit: 'g' },
  { id: 18, name: '두유',     category: '유제품', unit: 'ml' },
  { id: 19, name: '쌀',       category: '곡물',   unit: 'g' },
  { id: 20, name: '파스타',   category: '곡물',   unit: 'g' },
  { id: 21, name: '토마토',   category: '채소',   unit: '개' },
  { id: 22, name: '버섯',     category: '채소',   unit: '봉지' },
  { id: 23, name: '새우',     category: '해산물', unit: 'g' },
  { id: 24, name: '오징어',   category: '해산물', unit: '마리' },
  { id: 25, name: '치즈',     category: '유제품', unit: '장' },
];

/* ══════════════════════════════════════════════════════════
   ✅ 안전한 API 호출 헬퍼 함수
   
   문제: 백엔드가 500/401 에러 시 HTML을 반환
         → response.json() 에서 SyntaxError 발생
   
   해결: Content-Type이 JSON인지 먼저 확인 후 파싱
         JSON이 아니면(HTML 에러 페이지) 의미있는 에러 메시지 반환
══════════════════════════════════════════════════════════ */
const safeFetch = async (url, options = {}) => {
  const response = await fetch(url, options);

  const contentType = response.headers.get('content-type') || '';

  // ✅ 응답이 JSON이 아닌 경우 (HTML 에러 페이지 등)
  if (!contentType.includes('application/json')) {
    // 401: 토큰 없음/만료
    if (response.status === 401) {
      throw new Error('AUTH_ERROR'); // 로그인 필요 신호
    }
    // 500: 서버 내부 오류
    if (response.status === 500) {
      throw new Error('SERVER_ERROR');
    }
    throw new Error(`HTTP_ERROR_${response.status}`);
  }

  // ✅ JSON 응답 파싱
  const data = await response.json();
  return { response, data };
};

/* ══════════════════════════════════════════════════════════
   수량/유통기한 수정 모달
══════════════════════════════════════════════════════════ */
const QtyModal = ({ item, onSave, onClose }) => {
  const [qty,        setQty]        = useState(item.quantity ?? '');
  const [unit,       setUnit]       = useState(item.unit ?? '개');
  // ✅ 백엔드 FridgeItemResponse.exp 는 LocalDate → "2025-01-01" 형식 문자열
  const [expiryDate, setExpiryDate] = useState(
    item.exp ? String(item.exp) : ''
  );

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
const AddPanel = ({ myIngredients, onAdd, onRemove, onClose }) => {
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  const isInFridge = (name) => myIngredients.some(i => i.name === name);

  // 검색어 입력 시 API 호출 (디바운스 적용)
  useEffect(() => {
  if (!search.trim()) {
    const clear = async () => {
      setSearchResult([]);
    };
    clear();
    return;
  }

  const timer = setTimeout(() => {
    const doSearch = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/ingredients/search?name=${encodeURIComponent(search.trim())}`,
          { headers: getAuthHeaders() }
        );
        const json = await res.json();
        setSearchResult(json.results || []);
      } catch (err) {
        console.error('검색 실패:', err);
        setSearchResult([]);
      } finally {
        setIsSearching(false);
      }
    };
    doSearch();
  }, 300);

  return () => clearTimeout(timer);
}, [search]);

  // 직접 추가 버튼 표시 여부
  // 검색어가 있고 검색결과에 정확히 일치하는 이름이 없을 때
  const showManualBtn =
    search.trim() !== '' &&
    !isSearching &&
    !searchResult.some(i => i.name === search.trim());

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
          {/* 검색 중 */}
          {isSearching && (
            <div style={{
              gridColumn: '1/-1', textAlign: 'center',
              padding: '20px', color: '#718096'
            }}>
              검색 중...
            </div>
          )}

          {/* 검색 결과 */}
          {!isSearching && searchResult.map(ing => (
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
          ))}

          {/* 검색 결과 없음 */}
          {!isSearching && search.trim() && searchResult.length === 0 && !showManualBtn && (
            <div style={{
              gridColumn: '1/-1', textAlign: 'center',
              padding: '20px', color: '#718096'
            }}>
              검색 결과가 없습니다.
            </div>
          )}

          {/* 검색어 없을 때 안내 */}
          {!search.trim() && (
            <div style={{
              gridColumn: '1/-1', textAlign: 'center',
              padding: '20px', color: '#718096'
            }}>
              재료명을 입력하면 자동으로 검색됩니다
            </div>
          )}

          {/* 직접 추가 버튼 */}
          {showManualBtn && (
            <div
              className="ing-chip manual-add-chip"
              onClick={() => {
                onAdd({
                  id: null,
                  name: search.trim(),
                  category: 'etc',
                  unit: '개'
                });
                setSearch('');
              }}
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
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || '회원';

  const [items,        setItems]        = useState([]);
  const [masterList,   setMasterList]   = useState([]);
  const [addOpen,      setAddOpen]      = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pageError,    setPageError]    = useState(''); // 페이지 에러
  const [addError,     setAddError]     = useState(''); // 추가 에러

  // ✅ JWT 토큰을 Authorization 헤더에 담아 반환
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  // ✅ 인증 에러 처리 - 토큰 만료/없으면 로그인 페이지로
  const handleAuthError = () => {
    console.warn('⚠️ 인증 오류: 토큰이 없거나 만료됨 → 로그인 페이지로 이동');
    localStorage.clear();
    navigate('/user/login');
  };

  /* ── 페이지 진입 시 데이터 로딩 ─────────────────────── */
  useEffect(() => {
    // ✅ 토큰 존재 여부 먼저 확인
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('토큰 없음 → 로그인 페이지로 이동');
      navigate('/user/login');
      return;
    }

    const fetchData = async () => {
      try {
        // ── 1. 냉장고 재료 목록 조회 ─────────────────────
        // GET /user/fridge/items
        // 백엔드: FridgeController.getFridgeItems()
        // 응답: ApiResponse<List<FridgeItemResponse>>
        // FridgeItemResponse: { id, name, category, quantity, unit, exp, status, ... }
        const { response: fridgeRes, data: fridgeJson } =
          await safeFetch('/user/fridge/items', { headers: getAuthHeaders() });

        if (fridgeRes.ok) {
          // fridgeJson.data = List<FridgeItemResponse>
          setItems(fridgeJson.data || []);
          console.log('✅ 냉장고 재료 로드:', fridgeJson.data?.length, '개');
        } else {
          console.error('냉장고 조회 실패:', fridgeJson.message);
        }

        // ── 2. itemMaster 목록 조회 ──────────────────────
        // GET /item-master
        // 백엔드: ItemMasterController.getAllItems()
        // 응답: ApiResponse<List<ItemMasterResponse>>
        // ItemMasterResponse: { id, name, unit, category }
        try {
          const { response: masterRes, data: masterJson } =
            await safeFetch('/item-master', { headers: getAuthHeaders() });

          if (masterRes.ok && masterJson.data?.length > 0) {
            setMasterList(masterJson.data);
            console.log('✅ itemMaster 서버 로드:', masterJson.data.length, '개');
          } else {
            // DB에 데이터 없으면 임시 목록 사용
            console.warn('⚠️ itemMaster 데이터 없음 → DB에 INSERT 필요, 임시 목록 사용');
            setMasterList(FALLBACK_MASTER_LIST);
          }
        } catch (masterErr) {
          console.warn('⚠️ itemMaster API 실패 → 임시 목록 사용:', masterErr.message);
          setMasterList(FALLBACK_MASTER_LIST);
        }

      } catch (err) {
        // AUTH_ERROR: 토큰 없거나 만료
        if (err.message === 'AUTH_ERROR') {
          handleAuthError();
          return;
        }
        // SERVER_ERROR: 백엔드 500 에러
        if (err.message === 'SERVER_ERROR') {
          setPageError('서버에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          // 임시 목록은 유지
          setMasterList(FALLBACK_MASTER_LIST);
          return;
        }
        console.error('데이터 로드 실패:', err);
        setMasterList(FALLBACK_MASTER_LIST);
      }
    };

    fetchData();
  }, [navigate]);

  /* ── itemMaster 기반 재료 추가 ───────────────────────
     POST /user/fridge/items
     백엔드: FridgeController.addFridgeItem()
     요청 Body (FridgeItemCreateRequest):
       { itemMasterId, category, quantity, unit, exp, price, imageUrl }
     응답: ApiResponse<FridgeItemResponse>
  ─────────────────────────────────────────────────── */
  const handleAdd = async (ing) => {
    if (!ing.id) {
      setAddError('목록에 없는 재료는 추가할 수 없습니다. 검색 결과에서 선택해주세요.');
      return;
    }
    try {
      console.log('📦 재료 추가 시도:', ing.name, '(id:', ing.id, ')');

      // ✅ FridgeItemCreateRequest 필드에 맞춰 전송
      // exp: LocalDate 타입 → "YYYY-MM-DD" 문자열로 전송
      const requestBody = {
        itemMasterId: Number(ing.id),      // 필수 - ItemMaster PK
        category:     ing.category || 'etc',
        quantity:     1.0,                  // 기본 수량
        unit:         ing.unit || '개',
        exp:          getTodayStr(7),       // 기본 유통기한: 오늘 + 7일
        price:        null,
        imageUrl:     null,
      };

      console.log('📤 전송 데이터:', requestBody);

      const { response, data: result } = await safeFetch('/user/fridge/items', {
        method:  'POST',
        headers: getAuthHeaders(),
        body:    JSON.stringify(requestBody),
      });

      console.log('📥 응답 상태:', response.status, '/ 데이터:', result);

      if (response.ok) {
        // result.data = FridgeItemResponse
        setItems(prev => [...prev, result.data]);
        setAddError('');
        console.log('✅ 재료 추가 성공:', result.data?.name);
      } else {
        // 백엔드 에러 메시지 표시
        // 예) INVALID_INPUT: itemMasterId가 DB에 없을 때
        const msg = result.message || '재료 추가에 실패했습니다.';
        setAddError(msg);
        console.error('❌ 재료 추가 실패:', msg);
      }
    } catch (err) {
      if (err.message === 'AUTH_ERROR') {
        handleAuthError();
        return;
      }
      console.error('❌ 재료 추가 오류:', err);
      setAddError('재료 추가 중 오류가 발생했습니다.');
    }
  };

  /* ── 직접 입력 재료 추가 ──────────────────────────────
     POST /user/fridge/items/manual
     백엔드에 이 엔드포인트가 없으면 404 응답
     → FridgeController에 추가 필요
  ─────────────────────────────────────────────────── */
  const handleManualAdd = async (itemName) => {
    try {
      const { response, data: result } = await safeFetch('/user/fridge/items/manual', {
        method:  'POST',
        headers: getAuthHeaders(),
        body:    JSON.stringify({
          name:     itemName,
          category: 'etc',
          quantity: 1.0,
          unit:     '개',
          exp:      getTodayStr(7),
        }),
      });

      if (response.ok) {
        setItems(prev => [...prev, result.data]);
        setAddError('');
        console.log('✅ 직접 추가 성공:', itemName);
      } else {
        setAddError('직접 입력 기능은 백엔드 준비 중이에요.');
        console.warn('⚠️ /manual 엔드포인트 없음 → 백엔드에 추가 필요');
      }
    } catch (err) {
      if (err.message === 'AUTH_ERROR') { handleAuthError(); return; }
      setAddError('직접 입력 기능은 백엔드 준비 중이에요.');
    }
  };

  /* ── 재료 삭제 ────────────────────────────────────────
     DELETE /user/fridge/items/{itemId}
     백엔드: FridgeController.deleteFridgeItem()
  ─────────────────────────────────────────────────── */
  const handleRemove = async (itemId) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      const { response } = await safeFetch(`/user/fridge/items/${itemId}`, {
        method:  'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setItems(prev => prev.filter(i => i.id !== itemId));
        console.log('✅ 재료 삭제 성공:', itemId);
      }
    } catch (err) {
      if (err.message === 'AUTH_ERROR') { handleAuthError(); return; }
      console.error('재료 삭제 실패:', err);
    }
  };

  /* ── 수량/유통기한 수정 ────────────────────────────────
     PUT /user/fridge/items/{itemId}
     백엔드: FridgeController.updateFridgeItem()
     요청 Body (FridgeItemUpdateRequest):
       { quantity, unit, exp, price, category }
  ─────────────────────────────────────────────────── */
  const handleUpdateQty = async (itemId, quantity, unit, exp) => {
    try {
      const { response, data: result } = await safeFetch(
        `/user/fridge/items/${itemId}`,
        {
          method:  'PUT',
          headers: getAuthHeaders(),
          body:    JSON.stringify({
            quantity: quantity ? parseFloat(quantity) : null,
            unit:     unit || '개',
            exp:      exp || null,      // "YYYY-MM-DD" 또는 null
            price:    null,
            category: items.find(i => i.id === itemId)?.category || 'etc',
          }),
        }
      );

      if (response.ok) {
        // 수정된 재료만 교체
        setItems(prev => prev.map(i => i.id === itemId ? result.data : i));
        console.log('✅ 재료 수정 성공:', itemId);
      }
    } catch (err) {
      if (err.message === 'AUTH_ERROR') { handleAuthError(); return; }
      console.error('수량 수정 실패:', err);
    }
  };

  /* ── 유통기한 상태에 따른 CSS 클래스 ─────────────────
     백엔드 FridgeItem.status 값:
     FRESH       → 정상 (기본)
     NEAR_EXPIRY → 유통기한 3일 이내 임박
     EXPIRED     → 유통기한 만료
  ─────────────────────────────────────────────────── */
  const getStatusClass = (status) => {
    switch (status) {
      case 'NEAR_EXPIRY': return 'urgent';
      case 'EXPIRED':     return 'expired';
      default:            return 'fresh';
    }
  };

  // items 배열을 SHELF_SIZE(12)개씩 선반으로 나누기
  const shelves = [];
  for (let i = 0; i < items.length; i += SHELF_SIZE) {
    shelves.push(items.slice(i, i + SHELF_SIZE));
  }

  /* ── 렌더링 ─────────────────────────────────────────── */
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
          <button
            className="header-report-btn"
            style={{ display: 'flex', alignItems: 'center', height: '36px', boxSizing: 'border-box', background: '#fdd537', color: '#2a1f0e', fontWeight: 'bold', border: '2px solid #2a1f0e', borderRadius: '12px', padding: '0 14px', fontSize: '0.95rem', fontFamily: 'var(--font-title)', cursor: 'pointer' }}
            onClick={() => navigate('/user/report')}
          >
            📢 신고하기
          </button>
          <button
            className="header-user-btn"
            style={{ display: 'flex', alignItems: 'center', height: '36px', boxSizing: 'border-box', background: '#fdd537', color: '#2a1f0e', fontWeight: 'bold', border: '2px solid #2a1f0e', borderRadius: '12px', padding: '0 14px', fontSize: '0.95rem', fontFamily: 'var(--font-title)', cursor: 'pointer' }}
            onClick={() => navigate('/user/mypage')}
          >
            👤 {userName}님
          </button>
          <button
            className="header-logout-btn"
            style={{ display: 'flex', alignItems: 'center', height: '36px', boxSizing: 'border-box', background: '#fdd537', color: '#2a1f0e', fontWeight: 'bold', border: '2px solid #2a1f0e', borderRadius: '12px', padding: '0 14px', fontSize: '0.95rem', fontFamily: 'var(--font-title)', cursor: 'pointer' }}
            onClick={() => { localStorage.clear(); navigate('/'); }}
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 페이지 에러 배너 (500 에러 등) */}
      {pageError && (
        <div style={{
          background: 'rgba(220,50,50,0.1)',
          border: '1px solid rgba(220,50,50,0.3)',
          color: '#C82020',
          padding: '10px 20px',
          textAlign: 'center',
          fontSize: '0.88rem',
        }}>
          ⚠️ {pageError}
        </div>
      )}

      <div className="fridge-outer">

        <div className="fridge-top-panel">
          <span className="fridge-brand">"{userName}"님의 냉장고</span>
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

        {/* 냉장고 내부 */}
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
                      className={`fridge-item ${getStatusClass(item.status)}`}
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
                      <span className="qty-badge">
                        {item.quantity}{item.unit}
                      </span>
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

      {/* 재료 추가 실패 토스트 메시지 */}
      {addError && (
        <div
          style={{
            position: 'fixed', bottom: '80px', left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(220,50,50,0.9)', color: 'white',
            padding: '12px 24px', borderRadius: '999px',
            fontSize: '0.88rem', zIndex: 500, cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onClick={() => setAddError('')}
        >
          ⚠️ {addError}
        </div>
      )}

      {/* 수량/유통기한 수정 모달 */}
      {selectedItem && (
        <QtyModal
          item={selectedItem}
          onSave={handleUpdateQty}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* 재료 추가 패널 */}
      {addOpen && (
        <AddPanel
          myIngredients={items}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onClose={() => { setAddOpen(false); setAddError(''); }}
        />
      )}
    </div>
  );
}