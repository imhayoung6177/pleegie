import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/auth/AuthPage.css";
import "../../Styles/auth/RegisterPage.css";
import { registerMarket } from "../../services/marketService.js";
import pleegemarket from "../../assets/pleegemarket.png";

const MG  = "#B7CCAC";
const MGD = "#8fa882";
const MT  = "#2a1f0e";

const BG_LAYER = {
  position: "fixed",
  top: 0, left: 0,
  width: "100%", height: "100%",
  backgroundImage: `url(${pleegemarket})`,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  zIndex: 0,
};

const CONTENT_LAYER = {
  position: "relative",
  zIndex: 1,
  minHeight: "100vh",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "24px 16px 40px",
  boxSizing: "border-box",
};

const MarketRegisterPage = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified]     = useState(false);
  const [isBizLoading, setIsBizLoading] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [showPwC, setShowPwC] = useState(false);
  const [errors,  setErrors]  = useState({});

  const [form, setForm] = useState({
    userId: "", password: "", confirmPassword: "",
    bizNumber: "", marketName: "", ownerName: "",
    phone: "", address: "", latitude: "", longitude: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const handlePhoneChange = (e) => {
    const d = e.target.value.replace(/\D/g, "");
    let f = d;
    if (d.length > 3 && d.length <= 7) f = `${d.slice(0,3)}-${d.slice(3)}`;
    else if (d.length > 7)             f = `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7,11)}`;
    setForm(p => ({ ...p, phone: f }));
    if (errors.phone) setErrors(p => ({ ...p, phone: "" }));
  };

  const handleVerifyBiz = () => {
    if (!form.bizNumber.trim()) { setErrors(p => ({ ...p, bizNumber: "사업자 번호를 입력해주세요" })); return; }
    setIsVerified(true);
    setErrors(p => ({ ...p, bizNumber: "" }));
  };

  const validate = () => {
    const e = {};
    if (!isVerified)             e.bizNumber       = "사업자 인증을 먼저 완료해주세요";
    if (!form.marketName.trim()) e.marketName      = "상호명을 입력해주세요";
    if (!form.ownerName.trim())  e.ownerName       = "대표자명을 입력해주세요";
    if (!form.userId.trim())     e.userId          = "아이디를 입력해주세요";
    else if (form.userId.length < 4) e.userId      = "아이디는 4자 이상이어야 합니다";
    if (!form.password)          e.password        = "비밀번호를 입력해주세요";
    else if (form.password.length < 8) e.password  = "비밀번호는 8자 이상이어야 합니다";
    if (form.password !== form.confirmPassword)     e.confirmPassword = "비밀번호가 일치하지 않습니다";
    if (!form.phone)             e.phone           = "전화번호를 입력해주세요";
    if (!form.address.trim())    e.address         = "사업장 주소를 입력해주세요";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsLoading(true);
    try {
      await registerMarket({ userId: form.userId, password: form.password, phone: form.phone,
        name: form.marketName, ceoName: form.ownerName, businessNumber: form.bizNumber,
        latitude: parseFloat(form.latitude) || 0, longitude: parseFloat(form.longitude) || 0 });
      navigate("/market/login", { state: { successMessage: "회원가입 완료! 승인 후 로그인 가능합니다." } });
    } catch (err) { setErrors({ general: err.message || "회원가입에 실패했습니다." }); }
    finally { setIsLoading(false); }
  };

  /* 공통 입력 필드 렌더 헬퍼 */
  const Field = ({ id, label, name, type = "text", placeholder, value, onChange, readOnly, error, children }) => (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>{label}</label>
      <div className={`auth-input-wrap ${readOnly ? "readonly" : "editable"}`}>
        <input id={id} type={type} name={name} className="auth-input"
          placeholder={placeholder} value={value} onChange={onChange} readOnly={readOnly} />
        {children}
      </div>
      {error && <p className="auth-field-error">⚠ {error}</p>}
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <div style={BG_LAYER} />
      <div style={CONTENT_LAYER}>
        <div className="auth-card register-card anim-pop" style={{ margin: "24px auto" }}>

          <div className="auth-logo" onClick={() => navigate("/")}>
            <span className="auth-logo-text" style={{ color: 'black' }}>Pleegie</span>
          </div>
          <div className="auth-header">
            <h2 className="auth-title">상인 회원가입</h2>
            <p className="auth-sub">안전한 거래를 위해 사업자 인증이 필요합니다</p>
          </div>

          {errors.general && <div className="auth-error-box">⚠️ {errors.general}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>

            {/* 사업자 등록번호 */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="bizNumber">사업자 등록번호</label>
              <div className="reg-addr-row">
                <div className={`auth-input-wrap reg-addr-input ${isVerified ? "readonly" : "editable"}`}>
                  <input id="bizNumber" type="text" name="bizNumber" className="auth-input"
                    placeholder="'-' 제외 10자리 입력"
                    value={form.bizNumber} onChange={handleChange} readOnly={isVerified} maxLength={10} />
                </div>
                <button type="button" onClick={handleVerifyBiz} disabled={isVerified || isBizLoading}
                  style={{ background: isVerified ? "rgba(183,204,172,0.5)" : MG, color: MT, border: "none",
                    padding: "0 16px", borderRadius: "12px", height: "50px", whiteSpace: "nowrap",
                    fontFamily: "var(--font-body)", fontSize: "0.88rem",
                    cursor: isVerified ? "default" : "pointer", boxShadow: isVerified ? "none" : `0 2px 0 ${MGD}` }}>
                  {isVerified ? "✅ 인증완료" : isBizLoading ? "인증 중..." : "조회하기"}
                </button>
              </div>
              {errors.bizNumber && <p className="auth-field-error">⚠ {errors.bizNumber}</p>}
            </div>

            <Field id="marketName" label="상호명" name="marketName"
              placeholder={isVerified ? "가게 이름을 입력하세요" : "인증 후 입력 가능"}
              value={form.marketName} onChange={handleChange} readOnly={!isVerified} error={errors.marketName} />

            <Field id="ownerName" label="대표자명" name="ownerName"
              placeholder={isVerified ? "대표자 이름 입력" : "인증 후 입력 가능"}
              value={form.ownerName} onChange={handleChange} readOnly={!isVerified} error={errors.ownerName} />

            <Field id="userId" label="아이디" name="userId"
              placeholder={isVerified ? "영문, 숫자, _ 4자 이상" : "인증 후 입력 가능"}
              value={form.userId} onChange={handleChange} readOnly={!isVerified} error={errors.userId} />

            {/* 비밀번호 */}
            <div className="auth-field">
              <label className="auth-label">비밀번호</label>
              <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
                <input type={showPw ? "text" : "password"} name="password" className="auth-input"
                  placeholder={isVerified ? "8자 이상" : "인증 후 입력 가능"}
                  value={form.password} onChange={handleChange} readOnly={!isVerified} />
                {isVerified && <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(p => !p)}>{showPw ? "숨기기" : "보이기"}</button>}
              </div>
              {errors.password && <p className="auth-field-error">{errors.password}</p>}
            </div>

            {/* 비밀번호 확인 */}
            <div className="auth-field">
              <label className="auth-label">비밀번호 확인</label>
              <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
                <input type={showPwC ? "text" : "password"} name="confirmPassword" className="auth-input"
                  placeholder={isVerified ? "비밀번호를 한 번 더" : "인증 후 입력 가능"}
                  value={form.confirmPassword} onChange={handleChange} readOnly={!isVerified} />
                {isVerified && <button type="button" className="auth-pw-toggle" onClick={() => setShowPwC(p => !p)}>{showPwC ? "숨기기" : "보이기"}</button>}
              </div>
              {form.confirmPassword && (
                <p className={form.password === form.confirmPassword ? "auth-field-ok" : "auth-field-error"}>
                  {form.password === form.confirmPassword ? "비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다"}
                </p>
              )}
            </div>

            {/* 전화번호 */}
            <div className="auth-field">
              <label className="auth-label">전화번호</label>
              <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
                <input type="text" name="phone" className="auth-input"
                  placeholder={isVerified ? "010-0000-0000" : "인증 후 입력 가능"}
                  value={form.phone} onChange={handlePhoneChange} readOnly={!isVerified} maxLength={13} />
              </div>
              {errors.phone && <p className="auth-field-error">⚠ {errors.phone}</p>}
            </div>

            {/* 주소 */}
            <div className="auth-field">
              <label className="auth-label">
                사업장 주소 <span className="reg-addr-badge">가까운 고객 추천에 사용됩니다</span>
              </label>
              <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
                <input id="address" type="text" name="address" className="auth-input"
                  placeholder={isVerified ? "예) 서울시 마포구 홍익로 12" : "인증 후 입력 가능"}
                  value={form.address} onChange={handleChange} readOnly={!isVerified} />
              </div>
              {errors.address && <p className="auth-field-error">⚠ {errors.address}</p>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={!isVerified || isLoading}
              style={{ background: !isVerified ? "rgba(183,204,172,0.4)" : MG, color: MT,
                boxShadow: isVerified ? `0 3px 0 ${MGD}` : "none", opacity: !isVerified ? 0.6 : 1 }}>
              {isLoading ? <span className="auth-loading"><span className="auth-spinner" /> 가입 중...</span> : "상인 가입 신청하기"}
            </button>
          </form>

          <div className="auth-divider"><span>이미 계정이 있으신가요?</span></div>
          <Link to="/market/login" className="auth-link-btn"
            style={{ color: MG, borderColor: MG, background: "rgba(183,204,172,0.08)" }}>
            상인 로그인 하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MarketRegisterPage;