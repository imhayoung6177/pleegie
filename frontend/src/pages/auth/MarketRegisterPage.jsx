import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// ✅ RegisterPage와 동일한 CSS import
import "../../Styles/auth/AuthPage.css";
import "../../Styles/auth/RegisterPage.css";

const MarketRegisterPage = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    password: "",
    confirmPassword: "",
    bizNumber: "",
    marketName: "",
    ownerName: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [showPw,  setShowPw]  = useState(false);
  const [showPwC, setShowPwC] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // ✅ 전화번호 자동 하이픈 (RegisterPage와 동일 로직)
  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    let formatted = digits;
    if (digits.length <= 3) formatted = digits;
    else if (digits.length <= 7) formatted = `${digits.slice(0,3)}-${digits.slice(3)}`;
    else formatted = `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7,11)}`;
    setForm(prev => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
  };

  // ✅ 사업자 번호 인증 (현재는 테스트 모드)
  const handleVerifyBiz = () => {
    if (!form.bizNumber.trim()) {
      setErrors(prev => ({ ...prev, bizNumber: "사업자 번호를 입력해주세요" }));
      return;
    }
    alert("사업자 인증에 성공하였습니다! (테스트 모드)");
    setIsVerified(true);
    setErrors(prev => ({ ...prev, bizNumber: "" }));
  };

  // ✅ 유효성 검사 (RegisterPage와 동일한 패턴)
  const validate = () => {
    const newErrors = {};
    const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;

    if (!isVerified) newErrors.bizNumber = "사업자 인증을 먼저 완료해주세요";
    if (!form.marketName.trim()) newErrors.marketName = "상호명을 입력해주세요";
    if (!form.ownerName.trim())  newErrors.ownerName  = "대표자명을 입력해주세요";

    if (!form.userId.trim()) newErrors.userId = "아이디를 입력해주세요";
    else if (form.userId.length < 4) newErrors.userId = "아이디는 4자 이상이어야 합니다";
    else if (/[^a-zA-Z0-9_]/.test(form.userId)) newErrors.userId = "영문, 숫자, _ 만 사용 가능합니다";

    if (!form.password) newErrors.password = "비밀번호를 입력해주세요";
    else if (form.password.length < 8) newErrors.password = "비밀번호는 8자 이상이어야 합니다";

    if (!form.confirmPassword) newErrors.confirmPassword = "비밀번호를 한 번 더 입력해주세요";
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";

    if (!form.phone) newErrors.phone = "전화번호를 입력해주세요";
    else if (!phoneRegex.test(form.phone)) newErrors.phone = "올바른 전화번호 형식이 아닙니다 (010-0000-0000)";

    if (!form.address.trim()) newErrors.address = "사업장 주소를 입력해주세요";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstKey = Object.keys(newErrors)[0];
      document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setIsLoading(true);
    try {
      // ✅ 나중에 API 연동할 부분
      // await registerShop(form);
      console.log("상인 회원가입 데이터:", form);
      alert("상인 회원가입이 완료되었습니다!");
      navigate("/market/login");
    } catch (err) {
      setErrors({ general: err.message || "회원가입에 실패했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ RegisterPage와 완전히 동일한 구조/클래스명 사용
  return (
    <div className="auth-bg">
      <div className="auth-circle circle-left" />
      <div className="auth-circle circle-right" />

      <div className="auth-card register-card anim-pop">

        {/* 로고 */}
        <div className="auth-logo" onClick={() => navigate("/")}>
          <span className="auth-logo-text">Pleegie</span>
        </div>

        {/* 타이틀 */}
        <div className="auth-header">
          <h2 className="auth-title">상인 회원가입</h2>
          <p className="auth-sub">안전한 거래를 위해 사업자 인증이 필요합니다</p>
        </div>

        {/* 전체 에러 */}
        {errors.general && (
          <div className="auth-error-box">⚠️ {errors.general}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>

          {/* ── 1. 사업자 등록번호 + 인증 버튼 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="bizNumber">사업자 등록번호</label>
            {/* ✅ 인증 전/후 상태를 readonly/editable 클래스로 표현 */}
            <div className="reg-addr-row">
              <div className={`auth-input-wrap reg-addr-input ${isVerified ? "readonly" : "editable"}`}>
                <input
                  id="bizNumber"
                  type="text"
                  name="bizNumber"
                  className="auth-input"
                  placeholder="'-' 제외 10자리 입력"
                  value={form.bizNumber}
                  onChange={handleChange}
                  readOnly={isVerified}
                  maxLength={10}
                />
              </div>
              {/* ✅ reg-addr-btn 클래스 — RegisterPage.css에 이미 정의되어 있음 */}
              <button
                type="button"
                className="reg-addr-btn"
                onClick={handleVerifyBiz}
                disabled={isVerified}
                style={{ opacity: isVerified ? 0.6 : 1 }}
              >
                {isVerified ? "✅ 인증완료" : "조회하기"}
              </button>
            </div>
            {errors.bizNumber && <p className="auth-field-error">⚠ {errors.bizNumber}</p>}
          </div>

          {/* ── 2. 상호명 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="marketName">상호명</label>
            <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
              <input
                id="marketName"
                type="text"
                name="marketName"
                className="auth-input"
                placeholder={isVerified ? "가게 이름을 입력하세요" : "인증 후 입력 가능"}
                value={form.marketName}
                onChange={handleChange}
                readOnly={!isVerified}
              />
            </div>
            {errors.marketName && <p className="auth-field-error">{errors.marketName}</p>}
          </div>

          {/* ── 3. 대표자명 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="ownerName">대표자명</label>
            <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
              <input
                id="ownerName"
                type="text"
                name="ownerName"
                className="auth-input"
                placeholder={isVerified ? "대표자 이름 입력" : "인증 후 입력 가능"}
                value={form.ownerName}
                onChange={handleChange}
                readOnly={!isVerified}
              />
            </div>
            {errors.ownerName && <p className="auth-field-error">{errors.ownerName}</p>}
          </div>

          {/* ── 4. 아이디 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="userId">아이디</label>
            <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
              <input
                id="userId"
                type="text"
                name="userId"
                className="auth-input"
                placeholder={isVerified ? "영문, 숫자, _ 4자 이상" : "인증 후 입력 가능"}
                value={form.userId}
                onChange={handleChange}
                readOnly={!isVerified}
                maxLength={20}
              />
            </div>
            {errors.userId && <p className="auth-field-error">{errors.userId}</p>}
          </div>

          {/* ── 5. 비밀번호 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">비밀번호</label>
            <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
              <input
                id="password"
                type={showPw ? "text" : "password"}
                name="password"
                className="auth-input"
                placeholder={isVerified ? "8자 이상 입력하세요" : "인증 후 입력 가능"}
                value={form.password}
                onChange={handleChange}
                readOnly={!isVerified}
              />
              {isVerified && (
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(p => !p)}>
                  {showPw ? "숨기기" : "보이기"}
                </button>
              )}
            </div>
            {errors.password && <p className="auth-field-error">{errors.password}</p>}
          </div>

          {/* ── 6. 비밀번호 확인 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="confirmPassword">비밀번호 확인</label>
            <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
              <input
                id="confirmPassword"
                type={showPwC ? "text" : "password"}
                name="confirmPassword"
                className="auth-input"
                placeholder={isVerified ? "비밀번호를 한 번 더 입력하세요" : "인증 후 입력 가능"}
                value={form.confirmPassword}
                onChange={handleChange}
                readOnly={!isVerified}
              />
              {isVerified && (
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPwC(p => !p)}>
                  {showPwC ? "숨기기" : "보이기"}
                </button>
              )}
            </div>
            {/* ✅ RegisterPage와 동일한 실시간 비밀번호 일치 표시 */}
            {form.confirmPassword && (
              <p className={form.password === form.confirmPassword ? "auth-field-ok" : "auth-field-error"}>
                {form.password === form.confirmPassword ? "비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다"}
              </p>
            )}
            {errors.confirmPassword && !form.confirmPassword && (
              <p className="auth-field-error">{errors.confirmPassword}</p>
            )}
          </div>

          {/* ── 7. 전화번호 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="phone">전화번호</label>
            <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
              <input
                id="phone"
                type="text"
                name="phone"
                className="auth-input"
                placeholder={isVerified ? "010-0000-0000" : "인증 후 입력 가능"}
                value={form.phone}
                onChange={handlePhoneChange}
                readOnly={!isVerified}
                maxLength={13}
              />
            </div>
            {errors.phone && <p className="auth-field-error">⚠ {errors.phone}</p>}
          </div>

          {/* ── 8. 사업장 주소 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="address">
              사업장 주소
              <span className="reg-addr-badge">가까운 고객 추천에 사용됩니다</span>
            </label>
            <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
              <input
                id="address"
                type="text"
                name="address"
                className="auth-input"
                placeholder={isVerified ? "예) 서울시 마포구 홍익로 12" : "인증 후 입력 가능"}
                value={form.address}
                onChange={handleChange}
                readOnly={!isVerified}
              />
            </div>
            {errors.address && <p className="auth-field-error">⚠ {errors.address}</p>}
          </div>

          {/* ── 제출 버튼 ── */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={!isVerified || isLoading}
            style={{ opacity: !isVerified ? 0.5 : 1 }}
          >
            {isLoading ? (
              <span className="auth-loading">
                <span className="auth-spinner" /> 가입 중...
              </span>
            ) : (
              "상인 가입 신청하기"
            )}
          </button>
        </form>

        {/* 로그인으로 이동 */}
        <div className="auth-divider">
          <span>이미 계정이 있으신가요?</span>
        </div>
        <Link to="/market/login" className="auth-link-btn">
          상인 로그인 하기
        </Link>

      </div>
    </div>
  );
};

export default MarketRegisterPage;