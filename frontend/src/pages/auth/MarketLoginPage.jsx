import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/auth/AuthPage.css"; 
import '../../Styles/auth/MarketLoginPage.css';

const MarketLoginPage = ({ role }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userId: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 임시 로그인 로직 (실제로는 authService.js의 login 함수 호출)
    try {
      console.log("상인 로그인 시도:", form);
      setTimeout(() => {
        alert("상인님, 환영합니다!");
        navigate("/market/main"); // 상인 대시보드로 이동
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg market-theme">
      <div className="auth-card anim-pop">
        {/* 로고 클릭 시 홈으로 */}
        <div className="auth-logo" onClick={() => navigate("/")}>
          <span className="auth-logo-text">Pleege Business</span>
        </div>

        <div className="auth-header">
          <h2 className="auth-title">상인 전용 로그인</h2>
          <p className="auth-sub">사업자 파트너 전용 공간입니다.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* 아이디 입력 (흰색 바탕/수정 가능) */}
          <div className="auth-field">
            <label className="auth-label">아이디</label>
            <div className="auth-input-wrap editable">
              <input
                type="text"
                name="userId"
                className="auth-input"
                placeholder="상인 아이디 입력"
                value={form.userId}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 비밀번호 입력 (흰색 바탕/수정 가능) */}
          <div className="auth-field">
            <label className="auth-label">비밀번호</label>
            <div className="auth-input-wrap editable">
              <input
                type="password"
                name="password"
                className="auth-input"
                placeholder="비밀번호 입력"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn market" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "상인 로그인"}
          </button>
        </form>

        <div className="auth-divider">
          <span>아직 파트너가 아니신가요?</span>
        </div>

        {/* 상인 회원가입으로 연결 */}
        <Link to="/market/register" className="auth-link-btn">
          상인 입점 신청(회원가입)
        </Link>
        
        <p className="market-footer-note">
          아이디/비밀번호 분실 시 고객센터로 문의바랍니다.
        </p>
      </div>
    </div>
  );
};

export default MarketLoginPage;