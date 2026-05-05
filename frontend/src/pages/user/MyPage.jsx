import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../../Styles/user/MyPage.css';
import '../../Styles/auth/AuthPage.css';
import '../../Styles/auth/RegisterPage.css';
import profileimg from "../../assets/pleegie_img.png";
// ✅ 내부 탭으로 보일 컴포넌트들
import ProfileEdit from './ProfileEdit';
import LedgerPage  from './LedgerPage';
import RecipeBook  from './RecipeBook';
import CartPage    from './CartPage';

/* ══════════════════════════════════════════════════════════
   메뉴 데이터 (새로운 메뉴 추가됨)
══════════════════════════════════════════════════════════ */
const MENU = [
  { id: 'profile',  emoji: '✏️', label: '회원정보 수정', desc: '이름·비밀번호·주소 변경' },
  { id: 'ledger',   emoji: '📒', label: '가계부',       desc: '식재료 지출 내역 관리' },
  { id: 'recipes',  emoji: '📖', label: '레시피북',     desc: '저장한 레시피 모아보기' },
  { id: 'cart',     emoji: '🛒', label: '장바구니',     desc: '구매 예정 재료 목록' },
  { id: 'stamp',    emoji: '🎫', label: '스탬프 현황',   desc: '나의 리워드 혜택' },
  { id: 'local-currency', emoji: '💳', label: '지역 화폐 신청', desc: '전통시장 전용 카드 신청' },
  { id: 'report',   emoji: '📢', label: '신고하기',     desc: '불편 사항 및 신고 접수' },
];

/* ══════════════════════════════════════════════════════════
   탈퇴 모달 컴포넌트
══════════════════════════════════════════════════════════ */
const WithdrawModal = ({ userName, onConfirm, onClose }) => (
  <div className="mp-modal-overlay" onClick={onClose}>
    <div className="mp-modal" onClick={e => e.stopPropagation()}>
      <div className="mp-modal-icon">🚪</div>
      <div className="mp-modal-title">정말 탈퇴하시겠어요?</div>
      <div className="mp-modal-desc">{userName}님의 모든 데이터가<br />영구적으로 삭제됩니다.</div>
      <div className="mp-modal-btns">
        <button className="mp-modal-cancel" onClick={onClose}>취소</button>
        <button className="mp-modal-confirm" onClick={onConfirm}>탈퇴하기</button>
      </div>
    </div>
  </div>
);

export default function MyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'main';

  const [userInfo, setUserInfo] = useState({ name: '', phone: '', email: '', address: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  // ✅ 유저 정보 가져오기 함수 분리 (재사용 목적)
  const fetchUserData = async () => {
    try {
      const response = await fetch('/user/mypage', { headers: getAuthHeaders() });
      const result = await response.json();
      if (response.ok) setUserInfo(result.data);
    } catch (err) {
      console.error("회원 정보 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // ✅ 메뉴 클릭 시 페이지 이동 또는 탭 변경
  const handleMenuClick = (id) => {
    // 독립 페이지로 이동해야 하는 경우
    if (['stamp', 'report', 'coupons', 'local-currency'].includes(id)) {
      navigate(`/user/${id}`);
    } else {
      // 마이페이지 내에서 탭으로 보여주는 경우
      setSearchParams({ tab: id });
    }
  };

  const goBackMain = () => {
    setSearchParams({});
    fetchUserData(); // 💡 정보 수정 후 메인으로 돌아올 때 최신 정보를 다시 불러옴
  };

  const handleWithdraw = async () => {
    try {
      const response = await fetch('/user/mypage', { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { localStorage.clear(); navigate('/'); }
    } catch (err) { console.error(err); }
  };

  if (loading && activeTab === 'main') return <div className="mypage-loading">정보 로딩 중...</div>;

  // ✅ 탭별 렌더링 (ProfileEdit, Ledger 등 기존 로직 유지)
  if (activeTab === 'profile') return <ProfileEdit onBack={goBackMain} />;
  if (activeTab === 'ledger')  return <div className="mypage-subpage"><div className="mypage-white-box"><h2>📒 가계부</h2><LedgerPage onBack={goBackMain} /></div></div>;
  if (activeTab === 'recipes') return <div className="mypage-subpage"><div className="mypage-white-box"><h2>📖 레시피북</h2><RecipeBook onBack={goBackMain} /></div></div>;
  if (activeTab === 'cart')    return <div className="mypage-subpage"><div className="mypage-white-box"><h2>🛒 장바구니</h2><CartPage onBack={goBackMain} /></div></div>;

  // ✅ 마이페이지 메인 화면
  return (
    <div className="mypage">
      <div className="mp-header">
        <button className="mp-back-btn" onClick={() => navigate('/user/fridge')}>← 냉장고</button>
        <span className="mp-header-title">마이페이지</span>
        <div style={{ width: 90 }} />
      </div>

      <div className="mp-profile-card">
        {/* <div className="mp-avatar">👤</div> */}
        <div className="mp-avatar-rect-wrap">
    <img 
      src={profileimg} 
      alt="플리지 캐릭터들" 
      className="mp-avatar-full-img" 
    />
  </div>
        <div className="mp-profile-info">
          <div className="mp-profile-name">{userInfo.name}님</div>
          <div className="mp-role-row">
            <div className="mp-profile-role">{userInfo.role === 'SHOP' ? '소상공인' : '일반 회원'}</div>
            <button className="mp-withdraw-btn" onClick={() => setWithdrawOpen(true)}>회원 탈퇴</button>
          </div>
          <div className="mp-profile-details">
            <div className="mp-profile-detail-row">📧 {userInfo.email}</div>
            <div className="mp-profile-detail-row">📱 {userInfo.phone}</div>
            <div className="mp-profile-detail-row">📍 {userInfo.address}</div>
          </div>
        </div>
      </div>

      <div className="mp-menu-list">
        {MENU.map(item => (
          <button key={item.id} className="mp-menu-item" onClick={() => handleMenuClick(item.id)}>
            <span className="mp-item-emoji">{item.emoji}</span>
            <div className="mp-item-text">
              <strong className="mp-item-label">{item.label}</strong>
              <span className="mp-item-desc">{item.desc}</span>
            </div>
            <span className="mp-item-arrow">〉</span>
          </button>
        ))}
      </div>

      {withdrawOpen && (
        <WithdrawModal userName={userInfo.name} onConfirm={handleWithdraw} onClose={() => setWithdrawOpen(false)} />
      )}
    </div>
  );
}