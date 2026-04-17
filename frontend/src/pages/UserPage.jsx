import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UserPage.css'; // 이 파일도 없다면 주석 처리하세요!

const MENU_ITEMS = [
  {
    path: '/user/fridge', icon: '🧊', label: 'MY FRIDGE',
    title: '내 냉장고\n재료 등록', desc: '가지고 있는 재료를\n냉장고에 추가해보세요',
    btnText: '냉장고 열기', goClass: 'go-blue', barClass: 'bar-blue', animDelay: 'delay-2',
  },
  {
    path: '/user/recipe', icon: '🤖', label: 'AI RECIPE',
    title: 'AI 레시피\n추천', desc: '내 재료로 만들 수 있는\n요리를 AI가 추천해요',
    btnText: '레시피 보기', goClass: 'go-orange', barClass: 'bar-orange', animDelay: 'delay-3',
  },
  {
    path: '/user/menu', icon: '🍽️', label: 'AI INGREDIENTS',
    title: '먹고 싶은\n메뉴 재료 추천', desc: '먹고 싶은 요리의\n필요 재료를 알려드려요',
    btnText: '재료 알아보기', goClass: 'go-green', barClass: 'bar-green', animDelay: 'delay-4',
  },
];

const UserPage = () => {
  const navigate = useNavigate();

  return (
    /* PageWrapper 대신 일반 div를 사용하고 배경색을 줍니다 */
    <div style={{ padding: '20px', backgroundColor: '#f5ede0', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* 상단바 대용 */}
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.4rem', color: '#2a1f0e' }}>Pleege</h1>
        <span style={{ background: '#6ab4e8', color: 'white', padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem' }}>회원</span>
      </header>

      <div className="user-page">
        {/* 웰컴 배너 */}
        <div className="welcome-banner">
          <div className="welcome-card" style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '2rem' }}>🧊</span>
            <div className="welcome-text" style={{ marginTop: '10px' }}>
              <h2 style={{ fontSize: '1.2rem' }}>안녕하세요, 홍길동님! 👋</h2>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>
                오늘도 냉장고를 열어볼까요?<br />
                현재 냉장고에 재료가 <strong>8개</strong> 있어요.
              </p>
            </div>
          </div>
        </div>

        {/* 메뉴 섹션 */}
        <div className="menu-section" style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '15px', color: '#5a4a32' }}>🗂️ 무엇을 할까요?</h3>
          
          <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {MENU_ITEMS.map((item) => (
              <div
                key={item.path}
                className={`menu-card ${item.animDelay}`}
                onClick={() => navigate(item.path)}
                style={{ 
                  background: 'white', padding: '20px', borderRadius: '16px', 
                  borderTop: `5px solid ${item.barClass === 'bar-blue' ? '#6ab4e8' : item.barClass === 'bar-orange' ? '#e8732a' : '#4caf6e'}`,
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                <div style={{ fontSize: '0.7rem', color: '#9a8a70', marginTop: '10px' }}>{item.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', margin: '5px 0', whiteSpace: 'pre-line' }}>{item.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#777', marginBottom: '10px' }}>{item.desc}</div>
                <span style={{ color: '#6ab4e8', fontSize: '0.85rem' }}>{item.btnText} →</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;