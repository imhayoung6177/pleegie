import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/auth/AuthPage.css";
import { login } from "../../services/authService";
import pleegemarket from "../../assets/pleegemarket.png";

const MG  = "#B7CCAC";
const MGD = "#8fa882";
const MT  = "#2a1f0e";

/*
 * ✅ 배경 잘림 해결
 * - position: "fixed" + width/height "100%" → 항상 화면 전체 고정
 * - backgroundSize: "100% 100%" → 이미지를 가로/세로 모두 화면에 꽉 맞춤 (잘림 없음)
 * - cover는 비율을 유지하며 잘릴 수 있음, 100% 100%는 화면에 정확히 맞춤
 */
const BG_LAYER = {
  position: "fixed",
  top: 0, left: 0,
  width: "100%",
  height: "100%",
  backgroundImage: `url(${pleegemarket})`,
  backgroundSize: "100% 100%",       /* ✅ 잘림 없이 전체화면 꽉 채움 */
  backgroundRepeat: "no-repeat",
  zIndex: 0,
};

/* 콘텐츠가 올라갈 레이어 */
const CONTENT_LAYER = {
  position: "relative",
  zIndex: 1,
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 16px",
  boxSizing: "border-box",
};

const MarketLoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm]           = useState({ loginId: "", password: "" });
  const [errors, setErrors]       = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.loginId.trim()) e.loginId  = "아이디를 입력해주세요";
    if (!form.password)       e.password = "비밀번호를 입력해주세요";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsLoading(true);
    try {
      const data = await login(form);
      localStorage.setItem("accessToken",  data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userName",     data.user.name);
      localStorage.setItem("userRole",     data.user.role);
      localStorage.setItem("loginId",      data.user.loginId);
      navigate("/market/main");
    } catch (err) {
      setErrors({ general: err.message || "로그인 실패. 아이디와 비밀번호를 확인해주세요." });
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* 배경 레이어 - 항상 전체화면 고정 */}
      <div style={BG_LAYER} />

      {/* 콘텐츠 레이어 */}
      <div style={CONTENT_LAYER}>
        <div className="auth-card anim-pop">

          <div className="auth-logo" onClick={() => navigate("/")}>
            <span className="auth-logo-text" style={{ color: 'black' }}>Pleegie</span>
          </div>

          <div className="auth-header">
            <h2 className="auth-title">상인 로그인</h2>
            <p className="auth-sub">사업자 파트너 전용 공간입니다</p>
          </div>

          {errors.general && <div className="auth-error-box">⚠️ {errors.general}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">아이디</label>
              <div className={`auth-input-wrap ${errors.loginId ? "error" : "editable"}`}>
                <input type="text" name="loginId" className="auth-input"
                  placeholder="상인 아이디 입력"
                  value={form.loginId} onChange={handleChange} />
              </div>
              {errors.loginId && <p className="auth-field-error">{errors.loginId}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label">비밀번호</label>
              <div className={`auth-input-wrap ${errors.password ? "error" : "editable"}`}>
                <input type="password" name="password" className="auth-input"
                  placeholder="비밀번호 입력"
                  value={form.password} onChange={handleChange} />
              </div>
              {errors.password && <p className="auth-field-error">{errors.password}</p>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}
              style={{ background: MG, color: MT }}>
              {isLoading ? "로그인 중..." : "상인 로그인"}
            </button>
          </form>

          <div className="auth-divider"><span>아직 파트너가 아니신가요?</span></div>

          <Link to="/market/register" className="auth-link-btn"
            style={{ color: MG, borderColor: MG, background: "rgba(183,204,172,0.08)" }}>
            상인 입점 신청 (회원가입)
          </Link>

          <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#8a8a8a", marginTop: "12px" }}>
            아이디/비밀번호 분실 시 고객센터로 문의바랍니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketLoginPage;