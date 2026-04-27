import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/auth/AuthPage.css";

// ✅ [연동 추가] authService에서 login 함수 import
// → 백엔드 POST /auth/login API를 호출하는 함수
import { login } from "../../services/authService";

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

  // ✅ [연동] 클라이언트 사이드 유효성 검사 추가
  // → 서버 요청 전에 빈 값 체크로 불필요한 API 호출 방지
  const validate = () => {
    const newErrors = {};
    if (!form.userId.trim()) newErrors.userId = "아이디를 입력해주세요";
    if (!form.password)      newErrors.password = "비밀번호를 입력해주세요";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ [연동 추가] 제출 전 유효성 검사 실행
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      // ✅ [연동] 실제 API 호출로 교체
      // → role: "SHOP" 을 함께 전달해 상인 전용 로그인임을 백엔드에 알림
      // → 백엔드: POST /auth/login { userId, password, role: "SHOP" }
      const data = await login({ ...form, role: "SHOP" });

      // ✅ [연동] 서버 응답에서 받은 토큰/유저 정보를 localStorage에 저장
      // → 이후 API 요청 시 Authorization 헤더에 토큰을 붙이기 위함
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userName",    data.userName);
      localStorage.setItem("userRole",    data.role);      // "SHOP"

      // ✅ [이전 코드 주석처리] setTimeout 방식 제거
      // → 실제 API 응답을 기다리지 않고 임시로 1초 후 이동하던 테스트 코드
      // setTimeout(() => {
      //   localStorage.setItem("userName", "상인");
      //   localStorage.setItem("userRole", "SHOP");
      //   navigate("/market/main");
      // }, 1000);

      navigate("/market/main");

    } catch (err) {
      // ✅ [연동] 백엔드 에러 응답 메시지를 그대로 사용자에게 표시
      // → 예: "아이디 또는 비밀번호가 올바르지 않습니다"
      setErrors({ general: err.message || "로그인 실패. 아이디와 비밀번호를 확인해주세요." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card anim-pop">

        {/* 로고 */}
        <div className="auth-logo" onClick={() => navigate("/")}>
          <span className="auth-logo-text">Pleegie</span>
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

        <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#8a8a8a", marginTop: "12px" }}>
          아이디/비밀번호 분실 시 고객센터로 문의바랍니다
        </p>
      </div>
    </div>
  );
};

export default MarketLoginPage;