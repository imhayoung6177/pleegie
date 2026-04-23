import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/auth/AuthPage.css";
// ✅ MarketLoginPage.css 는 더 이상 필요 없으니 import 제거 가능

const MarketLoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userId: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("상인 로그인 시도:", form);
      // ✅ 나중에 authService.js의 login 함수로 교체할 부분
      // const data = await login({ ...form, role: 'SHOP' });
      setTimeout(() => {
        localStorage.setItem("userName", "상인");
        localStorage.setItem("userRole", "SHOP");
        navigate("/market/main");
      }, 1000);
    } catch (err) {
      setErrors({ general: err.message || "로그인 실패" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ✅ 핵심 변경: market-theme 제거 → LoginPage와 동일한 auth-bg만 사용
    <div className="auth-bg">
      <div className="auth-card anim-pop">
        
        {/* 로고 */}
        <div className="auth-logo" onClick={() => navigate("/")}>
          <span className="auth-logo-text">Pleege</span>
        </div>

        {/* 타이틀 */}
        <div className="auth-header">
          <h2 className="auth-title">상인 로그인</h2>
          <p className="auth-sub">사업자 파트너 전용 공간입니다</p>
        </div>

        {/* 전체 에러 */}
        {errors.general && (
          <div className="auth-error-box">⚠️ {errors.general}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">아이디</label>
            {/* ✅ LoginPage와 동일한 구조 */}
            <div className={`auth-input-wrap ${errors.userId ? "error" : "editable"}`}>
              <input
                type="text"
                name="userId"
                className="auth-input"
                placeholder="상인 아이디 입력"
                value={form.userId}
                onChange={handleChange}
              />
            </div>
            {errors.userId && <p className="auth-field-error">{errors.userId}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label">비밀번호</label>
            <div className={`auth-input-wrap ${errors.password ? "error" : "editable"}`}>
              <input
                type="password"
                name="password"
                className="auth-input"
                placeholder="비밀번호 입력"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            {errors.password && <p className="auth-field-error">{errors.password}</p>}
          </div>

          {/* ✅ 핵심 변경: market 클래스 제거 → LoginPage 기본 버튼 스타일 */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "상인 로그인"}
          </button>
        </form>

        <div className="auth-divider">
          <span>아직 파트너가 아니신가요?</span>
        </div>

        <Link to="/market/register" className="auth-link-btn">
          상인 입점 신청 (회원가입)
        </Link>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#8a8a8a', marginTop: '12px' }}>
          아이디/비밀번호 분실 시 고객센터로 문의바랍니다
        </p>
      </div>
    </div>
  );
};

export default MarketLoginPage;