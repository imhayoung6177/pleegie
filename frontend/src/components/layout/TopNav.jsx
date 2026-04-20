import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/TopNav.css';

/**
 * TopNav — 공통 상단 네비바
 *
 * Props:
 *  showBack  {boolean} 뒤로가기 버튼 표시 여부 (기본 false)
 *  backPath  {string}  뒤로가기 경로          (기본 '/user')
 *  badge     {string}  로고 옆 뱃지 텍스트    — 없으면 미표시
 *  userName  {string}  우측 유저 이름         — 없으면 미표시
 *  rightSlot {node}    우측 커스텀 영역
 */
const TopNav = ({
  showBack  = false, // 뒤로 가기 버튼 여부 
  backPath  = '/user', // 뒤로 가기 경로 
  badge     = null,
  userName  = null, // 유져이름 
  rightSlot = null,
}) => {
  const navigate = useNavigate();

  return (
    <nav className="top-nav">
      <button className="nav-logo" onClick={() => navigate('/')}>
        Pleege
        {badge && <span className="nav-logo-badge">{badge}</span>}
      </button>

      <div className="nav-right">
        {rightSlot}
        {userName && (
          <div className="nav-user-info">
            <div className="nav-avatar">👤</div>
            <span>{userName}님</span>
          </div>
        )}
        {showBack && (
          <button className="nav-back-btn" onClick={() => navigate(backPath)}>
            ← 돌아가기
          </button>
        )}
      </div>
    </nav>
  );
};

export default TopNav;