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

  // ✅ loginId: 백엔드 UserLoginRequest.loginId 와 완전 일치
  const [form, setForm]         = useState({ loginId: "", password: "" });
  const [errors, setErrors]     = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSocialLogin = (platform) => {
    window.location.href =
      `http://localhost:8080/oauth2/authorization/${platform.toLowerCase()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // form = { loginId, password }
      // authService.login()이 백엔드로 { loginId, password } 그대로 전송
      // 반환값: apiResponse.data = { accessToken, refreshToken, user }
      // user = UserResponse { id, loginId, name, role, status, ... }
      const data = await login(form);

      if (data.accessToken) {
        localStorage.setItem("accessToken",  data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("userName",     data.user.name);
        localStorage.setItem("userRole",     data.user.role);
        // ✅ loginId도 저장 (마이페이지 등에서 활용)
        localStorage.setItem("loginId",      data.user.loginId);

        // role에 따라 페이지 분기
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");

        if (redirect) {
          // QR 스캔 등 redirect 파라미터가 있으면 해당 페이지로
          navigate(redirect);
        } else {
          // 없으면 기존대로 role에 따라 분기
          const isMarket = data.user.role === "MARKET";
          navigate(isMarket ? "/shop/dashboard" : "/user/fridge");
        }
      }
    } catch (err) {
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

        {errors.general && (
          <p className="auth-field-error"
            style={{ textAlign: "center", marginBottom: "10px" }}>
            ⚠️ {errors.general}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>

          {/* ✅ name="loginId" → form.loginId에 저장 → 백엔드 loginId로 전송 */}
          <div className="auth-field">
            <label className="auth-label">아이디</label>
            <div className={`auth-input-wrap ${errors.loginId ? "error" : "editable"}`}>
              <input
                type="text"
                name="loginId"
                className="auth-input"
                placeholder="아이디 입력"
                value={form.loginId}
                onChange={handleChange}
                required
              />
            </div>
            {errors.loginId && <p className="auth-field-error">{errors.loginId}</p>}
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
                required
              />
            </div>
            {errors.password && <p className="auth-field-error">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className={`auth-submit-btn ${role === "SHOP" ? "shop" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 소셜 로그인 - 일반 회원만 */}
        {role !== "SHOP" && (
          <div className="social-login-section">
            <div className="auth-divider"><span>또는 간편 로그인</span></div>
            <div className="social-btns">
              <button className="social-btn kakao"
                onClick={() => handleSocialLogin("kakao")}>
                <img src={kakaoIcon} alt="카카오" className="social-img-icon" />
                카카오로 시작하기
              </button>
              <button className="social-btn naver"
                onClick={() => handleSocialLogin("naver")}>
                <img src={naverIcon} alt="네이버" className="social-img-icon" />
                네이버로 시작하기
              </button>
              <button className="social-btn google"
                onClick={() => handleSocialLogin("google")}>
                <img src={googleIcon} alt="구글" className="social-img-icon" />
                Google로 시작하기
              </button>
            </div>
          </div>
        )}

        <div className="auth-divider"><span>계정이 없으신가요?</span></div>
        <Link
          to={role === "SHOP" ? "/shop/register" : "/user/register"}
          className="auth-link-btn"
        >
          회원가입 하기
        </Link>

      </div>
    </div>
  );
};

export default LoginPage;