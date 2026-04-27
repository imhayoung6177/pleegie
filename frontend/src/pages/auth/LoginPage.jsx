import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/auth/AuthPage.css";
import { login } from "../../services/authService";
import kakaoIcon from "../../assets/kakao.png";
import naverIcon from "../../assets/naver.png";
import googleIcon from "../../assets/google.png";

const LoginPage = ({ role }) => {
  const navigate = useNavigate();
  const roleName = role === "SHOP" ? "소상공인" : "일반 회원";

  const [form, setForm] = useState({ userId: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

const handleSocialLogin = (platform) => {
  // Vite proxy 통해서 백엔드로 이동
  window.location.href = 
    `http://localhost:8080/oauth2/authorization/${platform.toLowerCase()}`;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // ✅ [수정후] authService의 apiLogin이 반환하는 진짜 데이터를 받음
      const data = await login({ ...form, role });
      
      // ✅ [수정후] 백엔드 UserLoginResponse 구조 { accessToken, refreshToken, user }
      if (data.accessToken) {
        // (수정전) localStorage.setItem("userName", data.userName);
        
        // 서버가 준 신분증들을 로컬 스토리지에 저장 (나중에 냉장고 페이지에서 사용)
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("userName", data.user.name); 
        localStorage.setItem("userRole", data.user.role);
        
        // 유저 역할에 따라 페이지 이동
        navigate(data.user.role === "MARKET" ? "/shop/dashboard" : "/user/fridge");
      }
    } catch (err) {
      // 백엔드 CustomException의 메시지를 화면에 표시
      setErrors({ general: err.message || "아이디 또는 비밀번호를 확인해주세요." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`auth-bg ${role === "SHOP" ? "shop-theme" : ""}`}>
      <div className="auth-card anim-pop">
        <div className="auth-logo" onClick={() => navigate("/")}>
          <span className="auth-logo-text">Pleegie</span>
        </div>

        <div className="auth-header">
          <h2 className="auth-title">{roleName} 로그인</h2>
          <p className="auth-sub">아이디와 비밀번호를 입력해주세요</p>
        </div>

        {/* 에러 메시지 표시 영역 */}
        {errors.general && <p className="auth-field-error" style={{textAlign:'center', marginBottom:'10px'}}>{errors.general}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">아이디</label>
            <div className={`auth-input-wrap ${errors.userId ? "error" : "editable"}`}>
              <input type="text" name="userId" className="auth-input" value={form.userId} onChange={handleChange} required />
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label">비밀번호</label>
            <div className={`auth-input-wrap ${errors.password ? "error" : "editable"}`}>
              <input type="password" name="password" className="auth-input" value={form.password} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className={`auth-submit-btn ${role === "SHOP" ? "shop" : ""}`} disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {role === "USER" && (
          <div className="social-login-section">
            <div className="auth-divider"><span>또는 간편 로그인</span></div>
            <div className="social-btns">
              <button className="social-btn kakao" onClick={() => handleSocialLogin("kakao")}>
                <img src={kakaoIcon} alt="카카오" className="social-img-icon" /> 카카오로 시작하기
              </button>
              <button className="social-btn naver" onClick={() => handleSocialLogin("naver")}>
                <img src={naverIcon} alt="네이버" className="social-img-icon" /> 네이버로 시작하기
              </button>
              <button className="social-btn google" onClick={() => handleSocialLogin("google")}>
                <img src={googleIcon} alt="구글" className="social-img-icon" /> Google로 시작하기
              </button>
            </div>
          </div>
        )}

        <div className="auth-divider"><span>계정이 없으신가요?</span></div>
        <Link to={role === "SHOP" ? "/shop/register" : "/user/register"} className="auth-link-btn">
          {roleName} 회원가입 하기
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;