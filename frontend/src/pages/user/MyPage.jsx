import React, { useState } from 'react';
import '../../Styles/user/MyPage.css';
import '../../Styles/auth/AuthPage.css';
import '../../Styles/auth/RegisterPage.css';

// ✅ 파일 구조에 맞게 각 컴포넌트 import
import ProfileEdit from './ProfileEdit';
import LedgerPage  from './LedgerPage';
import RecipeBook  from './RecipeBook';
import CartPage    from './CartPage';

/* ══════════════════════════════════════════════════════════
   메뉴 데이터
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

/* ══════════════════════════════════════════════════════════
   ✅ 공통 페이지 카드 래퍼
   - ProfileEdit / LedgerPage / RecipeBook / CartPage
     모두 이 흰색 박스 안에 들어감
══════════════════════════════════════════════════════════ */
const PageCard = ({ emoji, title, onBack, children }) => (
  <div style={{
    minHeight: '100vh',
    background: '#fdf6ee',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 16px 60px',
    boxSizing: 'border-box',
  }}>
    <div style={{
      width: '100%',
      maxWidth: '480px',
      background: '#ffffff',
      borderRadius: '20px',
      borderTop: '4px solid #FF6B35',
      padding: '32px 28px 40px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      boxSizing: 'border-box',
    }}>
      {/* 로고 */}
      <div style={{
        textAlign: 'center',
        fontFamily: "'Jua', sans-serif",
        fontSize: '1.8rem',
        color: '#FF6B35',
        fontWeight: 700,
        marginBottom: '8px',
      }}>
        Pleege
      </div>

      {/* 타이틀 */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{
          fontFamily: "'Jua', sans-serif",
          fontSize: '1.5rem',
          color: '#2a1f0e',
          margin: '0 0 4px',
          fontWeight: 700,
        }}>
          {emoji} {title}
        </h2>
      </div>

      {/* 내용 */}
      {children}

      {/* 뒤로가기 */}
      <div className="auth-divider" style={{ margin: '24px 0 16px' }}>
        <span>다른 메뉴로 이동할까요?</span>
      </div>
      <button className="auth-link-btn" onClick={onBack}>
        마이페이지로 돌아가기
      </button>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   탈퇴 모달
══════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════
   메인 MyPage
══════════════════════════════════════════════════════════ */
export default function MyPage() {
  const userName = localStorage.getItem('userName') || '이종빈';
  const userRole = localStorage.getItem('userRole') === 'SHOP' ? '소상공인' : '일반 회원';

  const userInfo = {
    userId:  'leejongbin',
    name:    userName,
    phone:   '010-1234-5678',
    email:   'leejb@example.com',
    address: '서울시 구로구 디지털로 300',
  };

  const [activeTab,    setActiveTab]    = useState('main');
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [ledgerItems,  setLedgerItems]  = useState([]);

  const handlePurchase = (item) => {
    setLedgerItems(prev => [{
      ...item,
      date: new Date().toLocaleDateString('ko-KR'),
      emoji: '🛒',
    }, ...prev]);
  };

  const goBack = () => setActiveTab('main');

  // ✅ 각 탭 → PageCard로 감싸서 흰색 박스 안에 렌더링
  if (activeTab === 'profile') {
    return <ProfileEdit userInfo={userInfo} onBack={goBack} />;
  }

  if (activeTab === 'ledger') {
    return (
      <PageCard emoji="📒" title="가계부" onBack={goBack}>
        <LedgerPage ledgerItems={ledgerItems} />
      </PageCard>
    );
  }

  if (activeTab === 'recipes') {
    return (
      <PageCard emoji="📖" title="나의 레시피북" onBack={goBack}>
        <RecipeBook />
      </PageCard>
    );
  }

  if (activeTab === 'cart') {
    return (
      <PageCard emoji="🛒" title="장바구니" onBack={goBack}>
        <CartPage onPurchase={handlePurchase} />
      </PageCard>
    );
  }

  // ✅ main 탭
  return (
    <div className="mypage">

      {/* 헤더 */}
      <div className="mp-header">
        <button className="mp-back-btn" onClick={() => window.history.back()}>
          ← 냉장고
        </button>
        <span className="mp-header-title">마이페이지</span>
        <div style={{ width: 90 }} />
      </div>

      {/* 프로필 카드 */}
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
          <div className="mp-stamp-row">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className={`mp-stamp-dot ${i < 4 ? 'filled' : ''}`} />
            ))}
          </div>
        </div>
      </div>

      {/* 2×2 메뉴 그리드 */}
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