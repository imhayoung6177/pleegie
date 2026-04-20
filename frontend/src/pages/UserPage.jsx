import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout';
import { SectionTitle } from '../components/ui';
import '../styles/UserPage.css';

/* ──────────────────────────────────────────
   UserPage — 회원 홈

   ✅ 변경사항:
   localStorage에서 로그인한 유저 이름을 가져와서 표시
   LoginPage에서 로그인 성공 시:
     localStorage.setItem('userName', response.data.userName)
   이 값을 여기서 꺼내서 사용
────────────────────────────────────────── */

const MENU_ITEMS = [
  {
    path: '/user/mypage', icon: '👤', label: 'MY PAGE',
    title: '마이페이지', desc: '정보수정·장바구니\n가계부·레시피북',
    btnText: '마이페이지', goClass: 'go-purple', barClass: 'bar-purple', animDelay: 'delay-1',
  },
  {
    path: '/user/fridge', icon: '🧊', label: 'MY FRIDGE',
    title: '내 냉장고\n재료 등록', desc: '가지고 있는 재료를\n냉장고에 추가해보세요',
    btnText: '냉장고 열기', goClass: 'go-blue', barClass: 'bar-blue', animDelay: 'delay-2',
  },
  {
    path: '/user/recipe', icon: '🤖', label: 'AI RECIPE',
    title: 'AI 레시피\n추천', desc: '내 재료로 만들 수 있는\nAI 레시피를 추천받아요',
    btnText: '레시피 보기', goClass: 'go-orange', barClass: 'bar-orange', animDelay: 'delay-3',
  },
  {
    path: '/user/menu', icon: '🍽️', label: 'MENU',
    title: '메뉴 선정', desc: '먹고 싶은 메뉴의\n재료를 알아봐요',
    btnText: '메뉴 선정', goClass: 'go-green', barClass: 'bar-green', animDelay: 'delay-3',
  },
  {
    path: '/user/qr', icon: '📱', label: 'QR STAMP',
    title: 'QR 방문\n인증하기', desc: '시장 QR을 스캔해서\n스탬프를 적립해요',
    btnText: 'QR 스캔', goClass: 'go-yellow', barClass: 'bar-yellow', animDelay: 'delay-4',
  },
  {
    path: '/user/report', icon: '🚨', label: 'REPORT',
    title: '신고하기', desc: '불편사항이나 문제를\n신고해주세요',
    btnText: '신고하기', goClass: 'go-red', barClass: 'bar-red', animDelay: 'delay-4',
  },
];

const UserPage = () => {
  const navigate = useNavigate();

  /* ── localStorage에서 로그인한 유저 이름 가져오기 ──────
     LoginPage.jsx 에서 로그인 성공 시 저장한 값:
       localStorage.setItem('userName', response.data.userName)

     없으면 '회원' 으로 기본값 표시
  */
  const userName = localStorage.getItem('userName') || '회원';

  return (
    <PageWrapper navProps={{ badge: '회원', userName }}>
      <div className="user-page">

        {/* 웰컴 배너 */}
        <div className="welcome-banner anim-fadeUp">
          <div className="welcome-card">
            <span className="welcome-fridge-icon">🧊</span>
            <div className="welcome-text">
              {/* ✅ 하드코딩 '홍길동' → localStorage의 실제 이름 */}
              <h2>안녕하세요, {userName}님! 👋</h2>
              <p>오늘도 냉장고를 열어볼까요?<br />
                현재 냉장고에 재료가 <strong>8개</strong> 있어요.</p>
            </div>
            <div className="welcome-stats">
              <div className="stat-chip">
                <div className="stat-num">8</div>
                <div className="stat-label">등록 재료</div>
              </div>
              <div className="stat-chip">
                <div className="stat-num">5</div>
                <div className="stat-label">추천 레시피</div>
              </div>
              <div
                className="stat-chip"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/user/mypage')}
              >
                <div className="stat-num">👤</div>
                <div className="stat-label">마이페이지</div>
              </div>
            </div>
          </div>
        </div>

        {/* 메뉴 카드 */}
        <div className="menu-section">
          <SectionTitle icon="🗂️">무엇을 할까요?</SectionTitle>
          <div className="menu-grid menu-grid-6">
            {MENU_ITEMS.map((item) => (
              <div
                key={item.path}
                className={`menu-card anim-pop ${item.animDelay}`}
                onClick={() => navigate(item.path)}
              >
                <div className={`menu-card-bar ${item.barClass}`} />
                <span className="menu-card-icon">{item.icon}</span>
                <div className="menu-card-label">{item.label}</div>
                <div className="menu-card-title" style={{ whiteSpace: 'pre-line' }}>{item.title}</div>
                <div className="menu-card-desc"  style={{ whiteSpace: 'pre-line' }}>{item.desc}</div>
                <span className={`menu-card-go ${item.goClass}`}>{item.btnText} →</span>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="recent-section anim-fadeUp delay-5">
          <SectionTitle icon="🕐">최근 활동</SectionTitle>
          <div className="recent-list">
            <div className="recent-item">
              <span className="recent-icon">🥕</span>
              <span className="recent-text"><strong>당근</strong>, <strong>양파</strong>, <strong>감자</strong> 등록</span>
              <span className="recent-time">방금 전</span>
            </div>
            <div className="recent-item">
              <span className="recent-icon">🤖</span>
              <span className="recent-text">AI가 <strong>된장찌개</strong> 레시피 추천</span>
              <span className="recent-time">1시간 전</span>
            </div>
            <div className="recent-item">
              <span className="recent-icon">🎫</span>
              <span className="recent-text"><strong>망원 전통시장</strong> QR 스탬프 적립</span>
              <span className="recent-time">어제</span>
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
};

export default UserPage;