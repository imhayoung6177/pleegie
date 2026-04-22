import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../Styles/HomePage.css';

/* ── 문 카드 컴포넌트 ── */
const DoorCard = ({ label, title, desc, cardClass }) => (
  <div className={`door-card ${cardClass}`}>
    <div className="card-subtitle">{label}</div>
    <div className="card-title">{title}</div>
    <div className="card-bar" />
    {desc && <div className="card-desc">{desc}</div>}
  </div>
);

/* ── 메인 앱 ── */
const HomePage = () => {
  const navigate = useNavigate();

  // 어느 쪽 문이 열렸는지 구분
  // null: 닫힘 / 'left': 왼쪽 열림 / 'right': 오른쪽 열림
  const [openSide, setOpenSide] = useState(null);

  const handleLogin = (role) => {
    // 이미 열리는 중이면 무시
    if (openSide !== null) return;

    if (role === '일반회원') {
      setOpenSide('left');
      // 문 열리는 애니메이션(1.3초) 후 이동
      setTimeout(() => navigate('/login'), 1300);
    }

    if (role === '소상공인') {
      setOpenSide('right');
      setTimeout(() => navigate('/shop/login'), 1300);
    }

    if (role === '관리자') {
      // 관리자는 문 열지 않고 바로 이동 (또는 별도 처리)
      navigate('/admin');
    }
  };

  return (
    <div className="app-bg">

      {/* ── 관리자 버튼 (우상단 고정) ── */}
      <button className="admin-btn" onClick={() => handleLogin('관리자')}>
        <span>⚙️</span>
        관리자 페이지로 가기
      </button>

      {/* ── 간판 ── 항상 표시 (isOpen 조건 제거) ── */}
      <div className="sign-wrapper">
        <div className="sign-board">
          <span className="sign-text">전통시장 재료 공구 사이트 Pleege</span>
        </div>
      </div>

      {/* ── 냉장고 씬 ── */}
      <div className="fridge-scene">

        {/* 냉장고 본체 */}
        <div className="fridge-body">

          {/* 외관 껍데기 */}
          <div className="fridge-shell" />

          {/* 내부 (문 열리면 보임) */}
          <div className="fridge-inside">
            <div className="fridge-inside-title">냉장고 내부</div>
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
            animate={{ rotateY: openSide === 'left' ? -118 : 0 }}
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
            animate={{ rotateY: openSide === 'right' ? 118 : 0 }}
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

export default HomePage;