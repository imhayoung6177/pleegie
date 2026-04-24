import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../Styles/HomePage.css';

/* ── 문 카드 컴포넌트 ── */
const DoorCard = ({ label, title, cardClass }) => (
  <div className={`door-card ${cardClass}`}>
    <div className="card-subtitle">{label}</div>
    <div className="card-title">{title}</div>
    <div className="card-bar" />
  </div>
);

/* ── 메인 앱 ── */
const HomePage = () => {
  const navigate = useNavigate();
  const [openSide, setOpenSide] = useState(null);

  const handleLogin = (role) => {
    if (openSide !== null) return;
    if (role === '일반회원') {
      setOpenSide('left');
      setTimeout(() => navigate('/user/login'), 1300);
    }
    if (role === '소상공인') {
      setOpenSide('right');
      setTimeout(() => navigate('/market/login'), 1300);
    }
    if (role === '관리자') {
      navigate('/admin');
    }
  };

  return (
    /*
     * app-bg = FridgePage의 fridge-page와 동일 구조
     * height: calc(100vh - 88px), flex column
     */
    <div className="app-bg">

      {/* ── 헤더 (page-header 동일 높이) ── */}
      <div className="home-header">
        <button className="admin-btn" onClick={() => handleLogin('관리자')}>
          <span>⚙️</span>
          관리자 페이지로 가기
        </button>
      </div>

      <div className="fridge-outer-wrap">
        <div className="fridge-scene">

          {/* 냉장고 본체 — fridge-scene을 absolute inset:0 으로 꽉 채움 */}
          <div className="fridge-body">

            {/* 외관 쉘 */}
            <div className="fridge-shell" />

            {/* 내부 (문 열리면 보임) */}
            {/* <div className="fridge-inside">
              <div className="fridge-inside-title">냉장고 내부</div>
              <div className="fridge-inside-sub">AI가 레시피를 조합 중입니다...</div>
              <div className="fridge-shelf-line" />
              <div className="ingredient-grid">
                {['🍅', '🥦', '🥚', '🧅', '🥕', '🥩'].map((e, i) => (
                  <div key={i} className="ingredient-item">{e}</div>
                ))}
              </div>
              <div className="fridge-shelf-line" />
            </div> */}

            {/* ── 왼쪽 문 (일반회원) ── */}
            <motion.div
              className="fridge-door door-left"
              onClick={() => handleLogin('일반회원')}
              animate={{ rotateY: openSide === 'left' ? -118 : 0 }}
              transition={{ duration: 1.3, ease: 'easeInOut' }}
              style={{ originX: 0, transformStyle: 'preserve-3d' }}
            >
              <div className="door-face door-front">
                <DoorCard label="USER" title="일반 회원" cardClass="user-card" />
              </div>
              <div className="door-face door-back" />
            </motion.div>

            {/* ── 오른쪽 문 (소상공인) ── */}
            <motion.div
              className="fridge-door door-right"
              onClick={() => handleLogin('소상공인')}
              animate={{ rotateY: openSide === 'right' ? 118 : 0 }}
              transition={{ duration: 1.3, ease: 'easeInOut' }}
              style={{ originX: 1, transformStyle: 'preserve-3d' }}
            >
              <div className="door-face door-front">
                <DoorCard label="SHOP" title="소상공인" cardClass="shop-card" />
              </div>
              <div className="door-face door-back" />
            </motion.div>

          </div>
        </div>

      </div>

      {/* 주방 소품 */}
      {/* <div className="kitchen-deco deco-plant-left">🌿</div>
      <div className="kitchen-deco deco-plant-right">🌿</div>
      <div className="kitchen-deco deco-pot-left">🪴</div>
      <div className="kitchen-deco deco-pot-right">🫙</div> */}

    </div>
  );
};

export default HomePage;