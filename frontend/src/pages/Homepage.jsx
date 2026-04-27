import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import bgImg from "../assets/image.png";
import topLeftImg from "../assets/door-top-left.png";
import topRightImg from "../assets/door-top-right.png";
import botLeftImg from "../assets/door-bot-left.png";
import botRightImg from "../assets/door-bot-right.png";
import baseImg from "../assets/door-base.png";

import "../Styles/HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [openSide, setOpenSide] = useState(null);

  // [추가] 로그인 상태 체크: 관리자라면 메인 페이지 접근 금지!
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // 관리자 토큰이 있다면, 메인 페이지를 보여주지 않고 즉시 대시보드로 보냅니다.
      // replace: true를 써서 브라우저 기록에 메인 페이지가 남지 않게 합니다.
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = (role) => {
    if (openSide !== null) return;
    if (role === "일반회원") {
      setOpenSide("left");
      setTimeout(() => navigate("/user/login"), 1400);
    } else if (role === "소상공인") {
      setOpenSide("right");
      setTimeout(() => navigate("/market/login"), 1400);
    }
  };

  return (
    <div className="app-bg">
      {/* 배경 이미지 */}
      <img src={bgImg} alt="배경" className="bg-img" />

      {/* 관리자 버튼 */}
      <div className="home-header">
        <button className="admin-btn" onClick={() => navigate("/admin/login")}>
          ⚙️ 관리자 페이지로 가기
        </button>
      </div>

      {/* 냉장고 전체 컨테이너 */}
      <div className="fridge-root">

        {/* ★★★ 냉장고 본체 내부 배경
            - fridge-root 기준 absolute
            - z-index:0 → 문(2) 뒤에 완전히 숨어있음
            - 문이 열리면 이 배경이 보임 */}
        <div className="fridge-bg-interior">
          {/* 유리 선반 3개 */}
          <div className="int-glass-shelf" style={{ top: '28%' }} />
          <div className="int-glass-shelf" style={{ top: '54%' }} />
          <div className="int-glass-shelf" style={{ top: '78%' }} />
        </div>

        {/* 상단 문 섹션 */}
        <div className="top-section">

          {/* 왼쪽 문 - 일반회원 */}
          <motion.div
            className="door"
            onClick={() => handleLogin("일반회원")}
            animate={{ rotateY: openSide === "left" ? -120 : 0 }}
            transition={{ duration: 1.3, ease: "easeOut" }}
            style={{
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
              cursor: "pointer",
            }}
          >
            <div className="door-face">
              <img src={topLeftImg} alt="왼쪽 문" className="piece" />
              <div className="post-it post-it-left">
                <div className="tape" />
                <span className="post-it-icon">🧑‍💼</span>
                <span className="post-it-text">일반회원</span>
              </div>
            </div>
            <div className="door-rear" />
          </motion.div>

          {/* 오른쪽 문 - 소상공인 */}
          <motion.div
            className="door"
            onClick={() => handleLogin("소상공인")}
            animate={{ rotateY: openSide === "right" ? 120 : 0 }}
            transition={{ duration: 1.3, ease: "easeOut" }}
            style={{
              transformOrigin: "right center",
              transformStyle: "preserve-3d",
              cursor: "pointer",
            }}
          >
            <div className="door-face">
              <img src={topRightImg} alt="오른쪽 문" className="piece" />
              <div className="post-it post-it-right">
                <div className="tape" />
                <span className="post-it-icon">🏪</span>
                <span className="post-it-text">소상공인</span>
              </div>
            </div>
            <div className="door-rear" />
          </motion.div>

        </div>

        {/* 하단 고정 문 - 절대 변경 금지 */}
        <div className="bot-section">
          <img src={botLeftImg}  alt="하단 왼쪽"  className="piece" style={{ width: "50%" }} />
          <img src={botRightImg} alt="하단 오른쪽" className="piece" style={{ width: "50%" }} />
        </div>

        {/* 받침대 - 절대 변경 금지 */}
        <div className="base-section">
          <img src={baseImg} alt="받침대" className="piece" />
        </div>

      </div>
    </div>
  );
};

export default HomePage;
