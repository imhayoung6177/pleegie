import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../Styles/HomePage.css";

/* ── 문 카드 컴포넌트 ── */
const DoorCard = ({ label, title, cardClass }) => (
  <div className={`door-card ${cardClass}`}>
    <div className="card-subtitle">{label}</div>
    <div className="card-title">{title}</div>
    <div className="card-bar" />
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [openSide, setOpenSide] = useState(null);

  const handleLogin = (role) => {
    if (openSide !== null) return;

    if (role === "일반회원") {
      setOpenSide("left");
      // 애니메이션 시간만큼 지연 후 페이지 이동
      setTimeout(() => navigate("/user/login"), 1300);
    }

    if (role === "소상공인") {
      setOpenSide("right");
      setTimeout(() => navigate("/market/login"), 1300);
    }

    if (role === "관리자") {
      navigate("/admin/login");
    }
  };

  return (
    <div className="app-bg">
      <div className="home-header">
        <button className="admin-btn" onClick={() => handleLogin('관리자')}>
          <span>⚙️</span> 관리자 페이지로 가기
        </button>
      </div>

      <div className="fridge-outer-wrap">
        <div className="fridge-scene">
          <div className="fridge-body">
            <div className="fridge-shell" />

            {/* 왼쪽 문 (일반회원 전용) */}
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

            {/* 오른쪽 문 (소상공인 전용) */}
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
    </div>
  );
};

export default HomePage;