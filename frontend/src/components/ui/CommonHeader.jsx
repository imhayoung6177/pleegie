// =====================================================
// CommonHeader.jsx
// FridgePage 헤더와 완전히 동일한 스타일로 통일
// =====================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CommonHeader = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || '회원';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    // ✅ FridgePage의 "page-header" 클래스와 동일한 인라인 스타일 적용
    <div className="page-header">

      {/* 로고 - FridgePage와 동일하게 page-title 클래스 사용 */}
      <h1
        className="page-title"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      >
        pleegie
      </h1>

      {/* 우측 버튼 그룹 - FridgePage header-actions와 동일 */}
      <div className="header-actions">

        {/* 신고하기 버튼 - FridgePage header-report-btn과 완전히 동일 */}
        <button
          className="header-report-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '36px',
            boxSizing: 'border-box',
            background: '#fdd537',
            color: '#2a1f0e',
            fontWeight: 'bold',
            border: '2px solid #2a1f0e',
            borderRadius: '12px',
            padding: '0 14px',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-title)',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/user/report')}
        >
          📢 신고하기
        </button>

        {/* 마이페이지 버튼 - FridgePage header-user-btn과 완전히 동일 */}
        <button
          className="header-user-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '36px',
            boxSizing: 'border-box',
            background: '#fdd537',
            color: '#2a1f0e',
            fontWeight: 'bold',
            border: '2px solid #2a1f0e',
            borderRadius: '12px',
            padding: '0 14px',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-title)',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/user/mypage')}
        >
          👤 {userName}님
        </button>

        {/* 로그아웃 버튼 - FridgePage header-logout-btn과 완전히 동일 */}
        <button
          className="header-logout-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '36px',
            boxSizing: 'border-box',
            background: '#fdd537',
            color: '#2a1f0e',
            fontWeight: 'bold',
            border: '2px solid #2a1f0e',
            borderRadius: '12px',
            padding: '0 14px',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-title)',
            cursor: 'pointer'
          }}
          onClick={handleLogout}
        >
          로그아웃
        </button>

      </div>
    </div>
  );
};

export default CommonHeader;