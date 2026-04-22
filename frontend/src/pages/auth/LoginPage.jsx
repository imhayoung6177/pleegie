import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/auth/AuthPage.css";
import { login } from "../../services/authService";
// 🚀 파일 이름을 스크린샷에 나온 실제 이름과 똑같이 맞췄습니다!
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

  // 🚀 소셜 로그인 핸들러 (나중에 여기에 API 연동)
  const handleSocialLogin = (platform) => {
    console.log(`${platform} 로그인 시도`);
    alert(`${platform} 로그인 기능은 준비 중입니다!`);
    // window.location.href = `API_URL/auth/${platform}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await login({ ...form, role });
      if (data.success) {
        localStorage.setItem("userName", data.userName);
        localStorage.setItem("userRole", role);
        navigate(role === "SHOP" ? "/shop/dashboard" : "/user/fridge");
      }
    } catch (err) {
      setErrors({ general: err.message || "로그인 실패" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`auth-bg ${role === "SHOP" ? "shop-theme" : ""}`}>
      <div className="auth-card anim-pop">
        <div className="auth-logo" onClick={() => navigate("/")}>
          <span className="auth-logo-text">Pleege</span>
        </div>

        <div className="auth-header">
          <h2 className="auth-title">{roleName} 로그인</h2>
          <p className="auth-sub">아이디와 비밀번호를 입력해주세요</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">아이디</label>
            <div className={`auth-input-wrap ${errors.userId ? "error" : "editable"}`}>
              <input type="text" name="userId" className="auth-input" value={form.userId} onChange={handleChange} />
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label">비밀번호</label>
            <div className={`auth-input-wrap ${errors.password ? "error" : "editable"}`}>
              <input type="password" name="password" className="auth-input" value={form.password} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" className={`auth-submit-btn ${role === "SHOP" ? "shop" : ""}`} disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 🚀 일반 회원일 때만 소셜 로그인 섹션 표시 */}
        {role === "USER" && (
          <div className="social-login-section">
            <div className="auth-divider">
              <span>또는 간편 로그인</span>
            </div>
            <div className="social-btns">
              <button className="social-btn kakao" onClick={() => handleSocialLogin("kakao")}>
                <img src={kakaoIcon} alt="카카오" className="social-img-icon" />
                  카카오로 시작하기
              </button>
              <button className="social-btn naver" onClick={() => handleSocialLogin("naver")}>
                <img src={naverIcon} alt="네이버" className="social-img-icon" />
                  네이버로 시작하기
              </button>
              <button className="social-btn google" onClick={() => handleSocialLogin("google")}>
                <img src={googleIcon} alt="구글" className="social-img-icon" />
                  Google로 시작하기
              </button>
            </div>
          </div>
        )}

        <div className="auth-divider">
          <span>계정이 없으신가요?</span>
        </div>
        <Link to={role === "SHOP" ? "/shop/register" : "/user/register"} className="auth-link-btn">
          {roleName} 회원가입 하기
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;