import React, { useState } from 'react';
import '../../Styles/user/MyPage.css';

/* ══════════════════════════════════════════════════════════
   메뉴 데이터 (2×2 그리드)
══════════════════════════════════════════════════════════ */
const MENU = [
  { id: 'profile', emoji: '✏️', label: '회원정보 수정', desc: '이름·비밀번호·주소 변경',
    color: '#3a90c8', bg: 'rgba(58,144,200,0.07)', border: 'rgba(58,144,200,0.18)' },
  { id: 'ledger',  emoji: '📒', label: '가계부',       desc: '식재료 지출 내역 관리',
    color: '#2aaa78', bg: 'rgba(42,170,120,0.07)', border: 'rgba(42,170,120,0.18)' },
  { id: 'recipes', emoji: '📖', label: '레시피북',     desc: '저장한 레시피 모아보기',
    color: '#e0902a', bg: 'rgba(224,144,42,0.07)', border: 'rgba(224,144,42,0.18)' },
  { id: 'cart',    emoji: '🛒', label: '장바구니',     desc: '구매 예정 재료 목록',
    color: '#9050c8', bg: 'rgba(144,80,200,0.07)', border: 'rgba(144,80,200,0.18)' },
];

const WITHDRAW = {
  id: 'withdraw', emoji: '🚪', label: '회원 탈퇴', desc: '계정을 영구 삭제합니다',
  color: '#e04040', bg: 'rgba(224,64,64,0.05)', border: 'rgba(224,64,64,0.18)',
};

/* ══ 레시피 더미 데이터 ════════════════════════════════ */
const RECIPE_DB = [
  {
    id: 1, emoji: '🍳', name: '계란볶음밥', time: '15분', difficulty: '쉬움',
    ingredients: ['계란 2개', '밥 1공기', '간장 1큰술', '파 약간', '참기름'],
    steps: [
      '파를 잘게 썰어 준비합니다.',
      '달궈진 팬에 기름을 두르고 계란을 스크램블합니다.',
      '밥을 넣고 강불에서 볶아줍니다.',
      '간장, 참기름을 넣고 마지막에 파를 올려 완성합니다.',
    ],
  },
  {
    id: 2, emoji: '🥘', name: '된장찌개', time: '20분', difficulty: '쉬움',
    ingredients: ['된장 2큰술', '두부 1/2모', '애호박 1/4개', '양파 1/4개', '멸치육수 2컵'],
    steps: [
      '멸치육수를 냄비에 넣고 끓입니다.',
      '된장을 풀어 넣습니다.',
      '두부, 애호박, 양파를 넣고 10분 끓입니다.',
      '기호에 따라 청양고추를 넣어 완성합니다.',
    ],
  },
  {
    id: 3, emoji: '🍜', name: '소고기무국', time: '30분', difficulty: '보통',
    ingredients: ['소고기 150g', '무 200g', '간장 2큰술', '마늘 1큰술', '참기름', '물 4컵'],
    steps: [
      '소고기를 참기름에 볶아줍니다.',
      '무를 나박썰기하여 넣고 함께 볶습니다.',
      '물을 붓고 20분간 끓입니다.',
      '간장과 소금으로 간을 맞춰 완성합니다.',
    ],
  },
  {
    id: 4, emoji: '🍝', name: '토마토 파스타', time: '25분', difficulty: '보통',
    ingredients: ['파스타 200g', '토마토 2개', '마늘 3쪽', '올리브오일', '소금', '파르메산치즈'],
    steps: [
      '파스타를 소금물에 삶습니다(8~10분).',
      '팬에 올리브오일을 두르고 마늘을 볶습니다.',
      '토마토를 넣고 으깨며 소스를 만듭니다.',
      '삶은 파스타를 넣고 버무려 치즈를 뿌려 완성합니다.',
    ],
  },
];

/* ══ 장바구니 더미 ════════════════════════════════════ */
const INIT_CART = [
  { id: 1, name: '소고기', price: 15000, emoji: '🥩', desc: '스테이크용 200g' },
  { id: 2, name: '애호박', price: 2000,  emoji: '🥒', desc: '된장찌개용 1개' },
  { id: 3, name: '두부',   price: 1500,  emoji: '⬜', desc: '찌개용 1모' },
];

/* ════════════════════════════════════════════════════════
   서브 컴포넌트들
════════════════════════════════════════════════════════ */

/* ── 회원정보 수정 ── */
const ProfileEdit = ({ userInfo }) => {
  const [form, setForm] = useState({
    userId:   userInfo?.userId   || 'leejongbin',
    name:     userInfo?.name     || '이종빈',
    password: '',
    phone:    userInfo?.phone    || '010-1234-5678',
    email:    userInfo?.email    || 'leejb@example.com',
    address:  userInfo?.address  || '서울시 구로구 디지털로 300',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mp-detail-content">
      <p className="mp-section-title">✏️ 회원정보 수정</p>
      <div className="profile-form">
        {/* 아이디 (읽기 전용) */}
        <div className="profile-field">
          <label className="profile-label">아이디 (변경 불가)</label>
          <div className="profile-input-wrap readonly">
            <input className="profile-input" type="text" value={form.userId} readOnly />
          </div>
        </div>
        {/* 이름 */}
        <div className="profile-field">
          <label className="profile-label">이름</label>
          <div className="profile-input-wrap">
            <input className="profile-input" type="text" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} placeholder="이름 입력" />
          </div>
        </div>
        {/* 비밀번호 */}
        <div className="profile-field">
          <label className="profile-label">새 비밀번호 (변경 시만 입력)</label>
          <div className="profile-input-wrap">
            <input className="profile-input" type="password" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} placeholder="새 비밀번호 (8자 이상)" />
          </div>
        </div>
        {/* 전화번호 */}
        <div className="profile-field">
          <label className="profile-label">전화번호</label>
          <div className="profile-input-wrap">
            <input className="profile-input" type="text" value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})} placeholder="010-0000-0000" />
          </div>
        </div>
        {/* 이메일 */}
        <div className="profile-field">
          <label className="profile-label">이메일</label>
          <div className="profile-input-wrap">
            <input className="profile-input" type="email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} placeholder="이메일 주소" />
          </div>
        </div>
        {/* 주소 */}
        <div className="profile-field">
          <label className="profile-label">주소</label>
          <div className="profile-input-wrap">
            <input className="profile-input" type="text" value={form.address}
              onChange={e => setForm({...form, address: e.target.value})} placeholder="집 주소 입력" />
          </div>
        </div>

        <button className="profile-save-btn" onClick={handleSave}>
          {saved ? '✅ 저장 완료!' : '수정 완료'}
        </button>
      </div>
    </div>
  );
};

/* ── 레시피북 ── */
const RecipeBook = () => {
  const [query,        setQuery]        = useState('');
  
  // 초기 데이터를 로컬 스토리지 + 기본 MOCK 데이터로 설정하여 불러옵니다.
  const [allRecipes, setAllRecipes] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    const combined = [...saved, ...RECIPE_DB];
    // id 중복 방지 처리 (최신 저장본이 남도록)
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    return unique;
  });
  
  const [searchResult, setSearchResult] = useState(allRecipes);
  const [selected,     setSelected]     = useState(null); // 상세보기 레시피

  const handleSearch = () => {
    const q = query.trim();
    if (!q) { setSearchResult(allRecipes); return; }
    setSearchResult(allRecipes.filter(r => r.name.includes(q)));
  };

  /* 상세 보기 */
  if (selected) {
    return (
      <div className="mp-detail-content">
        <button className="recipe-back-btn" onClick={() => setSelected(null)}>← 목록으로</button>

        <div className="recipe-detail-header">
          <span className="recipe-detail-emoji">{selected.emoji}</span>
          <div>
            <div className="recipe-detail-title">{selected.name}</div>
            <div className="recipe-detail-meta">⏱ {selected.time} · 난이도: {selected.difficulty}</div>
          </div>
        </div>

        <div className="recipe-detail-section">
          <div className="recipe-detail-section-title">🥬 필요 재료</div>
          <div className="recipe-ingredient-tags">
            {selected.ingredients.map(ing => (
              <span key={ing} className="recipe-ingredient-tag">{ing}</span>
            ))}
          </div>
        </div>

        <div className="recipe-detail-section">
          <div className="recipe-detail-section-title">📋 조리 순서</div>
          <div className="recipe-steps">
            {selected.steps.map((step, i) => (
              <div key={i} className="recipe-step">
                <div className="recipe-step-num">{i + 1}</div>
                <div className="recipe-step-text">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* 목록 */
  return (
    <div className="mp-detail-content">
      <p className="mp-section-title">📖 나의 레시피북</p>

      <div className="recipe-book-search-wrap">
        <input
          className="recipe-book-search-inp"
          type="text"
          placeholder="레시피 이름으로 검색 (예: 된장찌개)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="recipe-book-search-btn" onClick={handleSearch}>검색</button>
      </div>

      <div className="recipe-board-list">
        {searchResult.length === 0 ? (
          <div className="ledger-empty">검색 결과가 없어요 😅</div>
        ) : searchResult.map(r => (
          <div key={r.id} className="recipe-board-item" onClick={() => setSelected(r)}>
            <span className="recipe-board-emoji">{r.emoji}</span>
            <div className="recipe-board-info">
              <div className="recipe-board-name">{r.name}</div>
              <div className="recipe-board-meta">⏱ {r.time} &nbsp;·&nbsp; 난이도: {r.difficulty}</div>
            </div>
            <span className="recipe-board-arrow">›</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── 가계부 ── */
const LedgerPage = ({ ledgerItems: propItems = [] }) => {
  const [items, setItems] = useState([
    { id: 1, name: '시장 장보기', price: 28500, date: '2025-04-20', emoji: '🛒' },
    { id: 2, name: '계란 한판',   price: 8900,  date: '2025-04-18', emoji: '🥚' },
    ...propItems,
  ]);
  const [form, setForm] = useState({ name: '', price: '' });

  const handleAdd = () => {
    if (!form.name.trim() || !form.price) return;
    const newItem = {
      id: Date.now(),
      name: form.name,
      price: Number(form.price),
      date: new Date().toLocaleDateString('ko-KR'),
      emoji: '🧾',
    };
    setItems(prev => [newItem, ...prev]);
    setForm({ name: '', price: '' });
  };

  const handleDelete = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const total = items.reduce((s, i) => s + i.price, 0);

  return (
    <div className="mp-detail-content">
      <p className="mp-section-title">📒 가계부</p>

      {/* 직접 입력 폼 */}
      <div className="ledger-add-form">
        <div className="ledger-form-title">+ 지출 직접 입력</div>
        <div className="ledger-form-row">
          <input
            className="ledger-inp"
            type="text"
            placeholder="항목명 (예: 소고기 구매)"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <input
            className="ledger-inp ledger-inp-price"
            type="number"
            placeholder="금액(원)"
            value={form.price}
            onChange={e => setForm({...form, price: e.target.value})}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button className="ledger-add-btn" onClick={handleAdd}>추가</button>
        </div>
      </div>

      {/* 합계 */}
      <div className="ledger-total">
        <span className="ledger-total-label">이번 달 총 지출</span>
        <span className="ledger-total-amount">{total.toLocaleString()}원</span>
      </div>

      {/* 리스트 */}
      <div className="ledger-list" style={{ marginTop: 12 }}>
        {items.length === 0 ? (
          <div className="ledger-empty">아직 지출 내역이 없어요</div>
        ) : items.map(item => (
          <div key={item.id} className="ledger-item">
            <div className="ledger-item-icon">{item.emoji}</div>
            <div className="ledger-item-info">
              <div className="ledger-item-name">{item.name}</div>
              <div className="ledger-item-date">{item.date}</div>
            </div>
            <div className="ledger-item-price">{item.price.toLocaleString()}원</div>
            <button className="ledger-delete-btn" onClick={() => handleDelete(item.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── 장바구니 ── */
const CartPage = ({ onPurchase }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const combined = [...INIT_CART, ...saved];
    // 이름 기준으로 중복 제거하여 불러오기
    return Array.from(new Map(combined.map(item => [item.name, item])).values());
  });

  const handleBuy = (item) => {
    alert(`'${item.name}' 구매가 완료되었습니다!\n(가계부 지출 내역에 등록됩니다)`);
    if (onPurchase) onPurchase(item);
    setCartItems(prev => prev.filter(i => i.id !== item.id));
    
    // 로컬 스토리지에서도 삭제
    const saved = JSON.parse(localStorage.getItem('cartItems') || '[]');
    localStorage.setItem('cartItems', JSON.stringify(saved.filter(i => i.name !== item.name)));
  };

  return (
    <div className="mp-detail-content">
      <p className="mp-section-title">🛒 장바구니</p>
      <div className="cart-list">
        {cartItems.length === 0 ? (
          <div className="ledger-empty">장바구니가 비었습니다 🛍️</div>
        ) : cartItems.map(item => (
          <div key={item.id} className="cart-card">
            <span className="cart-emoji">{item.emoji}</span>
            <div className="cart-info">
              <strong className="cart-name">{item.name}</strong>
              <span className="cart-desc">{item.desc}</span>
            </div>
            <div className="cart-action">
              <span className="cart-price">{item.price.toLocaleString()}원</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="buy-btn" onClick={() => handleBuy(item)}>구매 완료</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── 탈퇴 모달 ── */
const WithdrawModal = ({ userName, onConfirm, onClose }) => (
  <div className="mp-modal-overlay" onClick={onClose}>
    <div className="mp-modal" onClick={e => e.stopPropagation()}>
      <div className="mp-modal-icon">🚪</div>
      <div className="mp-modal-title">정말 탈퇴하시겠어요?</div>
      <div className="mp-modal-desc">
        {userName}님의 모든 데이터가<br />영구적으로 삭제됩니다.
      </div>
      <div className="mp-modal-btns">
        <button className="mp-modal-cancel"  onClick={onClose}>취소</button>
        <button className="mp-modal-confirm" onClick={onConfirm}>탈퇴하기</button>
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════
   메인 MyPage
════════════════════════════════════════════════════════ */
export default function MyPage() {
  const userName = localStorage.getItem('userName') || '이종빈';
  const userRole = localStorage.getItem('userRole') === 'SHOP' ? '소상공인' : '일반 회원';

  // 더미 유저 정보 (백엔드 연결 시 API로 교체)
  const userInfo = {
    userId:  'leejongbin',
    name:    userName,
    phone:   '010-1234-5678',
    email:   'leejb@example.com',
    address: '서울시 구로구 디지털로 300',
  };

  const [activeTab,   setActiveTab]   = useState('main');
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [ledgerItems, setLedgerItems]  = useState([]);

  const handlePurchase = (item) => {
    setLedgerItems(prev => [{
      ...item, date: new Date().toLocaleDateString('ko-KR'), emoji: '🛒',
    }, ...prev]);
  };

  const handleBack = () => {
    if (activeTab === 'main') window.history.back();
    else setActiveTab('main');
  };

  const currentMenu = MENU.find(m => m.id === activeTab);

  return (
    <div className="mypage">
      {/* ── 헤더 ── */}
      <div className="mp-header">
        <button className="mp-back-btn" onClick={handleBack}>
          {activeTab === 'main' ? '← 냉장고' : '← 뒤로'}
        </button>
        <span className="mp-header-title">
          {activeTab === 'main' ? '마이페이지' : currentMenu?.label || ''}
        </span>
        <div style={{ width: 90 }} />
      </div>

      {activeTab === 'main' ? (
        <>
          {/* ── 프로필 카드 ── */}
          <div className="mp-profile-card">
            <div className="mp-avatar">👤</div>
            <div className="mp-profile-info">
              <div className="mp-profile-name">{userInfo.name}님</div>
              <div className="mp-role-row">
                <div className="mp-profile-role">{userRole}</div>
                <button className="mp-withdraw-btn" onClick={() => setWithdrawOpen(true)}>
                  회원 탈퇴
                </button>
              </div>

              {/* ✅ 이메일·전화·주소 표시 */}
              <div className="mp-profile-details">
                <div className="mp-profile-detail-row">
                  <span className="mp-detail-icon">📧</span>
                  <span className="mp-detail-val">{userInfo.email}</span>
                </div>
                <div className="mp-profile-detail-row">
                  <span className="mp-detail-icon">📱</span>
                  <span className="mp-detail-val">{userInfo.phone}</span>
                </div>
                <div className="mp-profile-detail-row">
                  <span className="mp-detail-icon">📍</span>
                  <span className="mp-detail-val">{userInfo.address}</span>
                </div>
              </div>

              {/* 스탬프 */}
              <div className="mp-stamp-row">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className={`mp-stamp-dot ${i < 4 ? 'filled' : ''}`} />
                ))}
              </div>
            </div>
          </div>

          {/* ── 2×2 메뉴 그리드 ── */}
          <div className="mp-menu-list">
            {MENU.map(item => (
              <button
                key={item.id}
                className="mp-menu-item"
                style={{
                  '--item-color':  item.color,
                  '--item-bg':     item.bg,
                  '--item-border': item.border,
                }}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="mp-item-emoji">{item.emoji}</span>
                <div className="mp-item-text">
                  <strong className="mp-item-label">{item.label}</strong>
                  <span className="mp-item-desc">{item.desc}</span>
                </div>
              </button>
            ))}
          </div>


        </>
      ) : (
        <div className="mp-detail-view">
          {activeTab === 'profile' && <ProfileEdit userInfo={userInfo} />}
          {activeTab === 'ledger'  && <LedgerPage ledgerItems={ledgerItems} />}
          {activeTab === 'recipes' && <RecipeBook />}
          {activeTab === 'cart'    && <CartPage onPurchase={handlePurchase} />}
        </div>
      )}

      {/* 탈퇴 모달 */}
      {withdrawOpen && (
        <WithdrawModal
          userName={userInfo.name}
          onConfirm={() => { localStorage.clear(); window.location.href = '/'; }}
          onClose={() => setWithdrawOpen(false)}
        />
      )}
    </div>
  );
}