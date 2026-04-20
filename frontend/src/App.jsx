import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './App.css';

/* ── 문 카드 컴포넌트 ── */
const DoorCard = ({ label, title, desc, cardClass }) => (
  <div className={`door-card ${cardClass}`}>
    {/* <span className="card-deco">🍓</span> */}
    {/* <span className="card-icon">{label === 'USER' ? '<회원>' : '<사업자>'}</span> */}
    <div className="card-subtitle">{label}</div>
    <div className="card-title">{title}</div>
    <div className="card-bar" />
    {desc && <div className="card-desc">{desc}</div>}
  </div>
);

/* ── 메인 앱 ── */
const App = () => {
  const navigate = useNavigate(); 
  const [isOpen, setIsOpen] = useState(false);

  // role 에 따라 문을 열고 해당 경로로 이동
  const handleLogin = (role) => {
    if (isOpen) return;
    setIsOpen(true);

    setTimeout(() => {
      if (role === '일반회원') navigate('/login');
if (role === '소상공인') navigate('/shop/login');
if (role === '관리자') setIsOpen(false);  // 관리자만 문 다시 닫힘
      // 이동 안 하는 경우 문 다시 닫기
      if (role !== '일반회원') setIsOpen(false);
    }, 1300); // 문 열리는 애니메이션(1.3초) 끝나는 타이밍
  };

  return (
    <div className="app-bg">

      {/* ── 관리자 버튼 (우상단 고정) ── */}
      <button className="admin-btn" onClick={() => handleLogin('관리자')}>
        <span>⚙️</span>
        관리자 페이지로 가기
      </button>

      {/* ── 간판 ── */}
      {!isOpen && (
        <div className="sign-wrapper">
          <div className="sign-board">
            <span className="sign-text">냉장고 요리소</span>
          </div>
        </div>
      )}

      {/* ── 냉장고 씬 ── */}
      <div className="fridge-scene">

        {/* 냉장고 본체 */}
        <div className="fridge-body">

          {/* 외관 껍데기 */}
          <div className="fridge-shell" />

          {/* 내부 (문 열리면 보임) */}
          <div className="fridge-inside">
            <div className="fridge-inside-title"> 냉장고 내부</div>
            <div className="fridge-inside-sub">AI가 레시피를 조합 중입니다...</div>
            <div className="fridge-shelf-line" />
            <div className="ingredient-grid">
              {['🍅', '🥦', '🥚', '🧅', '🥕', '🥩'].map((e, i) => (
                <div key={i} className="ingredient-item">{e}</div>
              ))}
            </div>
            <div className="fridge-shelf-line" />
          </div>

          {/* ── 왼쪽 문 (일반회원) ── */}
          <motion.div
            className="fridge-door door-left"
            onClick={() => handleLogin('일반회원')}
            animate={{ rotateY: isOpen ? -118 : 0 }}
            transition={{ duration: 1.3, ease: 'easeInOut' }}
            style={{ originX: 0, transformStyle: 'preserve-3d' }}
          >
            <DoorCard
              label="USER"
              title="일반 회원"
              desc="로그인 / 회원가입"
              cardClass="user-card"
            />
            <div className="door-handle" />
          </motion.div>

          {/* ── 오른쪽 문 (소상공인) ── */}
          <motion.div
            className="fridge-door door-right"
            onClick={() => handleLogin('소상공인')}
            animate={{ rotateY: isOpen ? 118 : 0 }}
            transition={{ duration: 1.3, ease: 'easeInOut' }}
            style={{ originX: 1, transformStyle: 'preserve-3d' }}
          >
            <DoorCard
              label="SHOP"
              title="소상공인"
              desc="사업자 전용 로그인"
              cardClass="shop-card"
            />
            <div className="door-handle" />
          </motion.div>

        </div>

        {/* 하단 서랍 */}
        <div className="fridge-drawer">
          <div className="drawer-handle" />
        </div>

        {/* 바닥 그림자 */}
        <div className="fridge-ground-shadow" />
      </div>

      {/* 주방 소품 */}
      <div className="kitchen-deco deco-plant-left">🌿</div>
      <div className="kitchen-deco deco-plant-right">🌿</div>
      <div className="kitchen-deco deco-pot-left">🪴</div>
      <div className="kitchen-deco deco-pot-right">🫙</div>

      {/* 주방 바닥 */}
      <div className="kitchen-floor" />
    </div>
  );
};

export default App;