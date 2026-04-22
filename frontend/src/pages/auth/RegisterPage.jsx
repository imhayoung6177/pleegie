import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/auth/AuthPage.css";
import "../../Styles/auth/RegisterPage.css";
import { register } from "../../services/authService";

/* ──────────────────────────────────────────
   RegisterPage — 일반 회원 회원가입 페이지

   입력 필드: 아이디, 비밀번호, 비밀번호확인,
              이름, 전화번호, 이메일, 집주소(직접 입력)

   [나중에 백엔드 연결할 부분]
   handleSubmit 함수 안 주석을 해제하고
   API URL만 바꿔주면 됩니다!
   POST /api/auth/register
────────────────────────────────────────── */
const RegisterPage = () => {
  const navigate = useNavigate();

  /* ── 폼 상태 관리 ──────────────────────────
     모든 입력 필드를 객체 하나로 관리
     값이 바뀌면 화면이 자동으로 다시 렌더링됨
  */
  const [form, setForm] = useState({
    userId: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
    email: "",
    address: "", // 집 주소 (사용자가 직접 입력)
    addressDetail: "", // 상세 주소 (동, 호수 등)
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPwC, setShowPwC] = useState(false);
  const [agree, setAgree] = useState(false);

  /* ── 공통 입력 변경 핸들러 ──────────────────
     input의 name 속성과 state의 key를 맞춰서
     함수 하나로 모든 input을 처리하는 실무 패턴
  */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // 타이핑 시작 시 해당 필드 에러 제거
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /* ── 전화번호 자동 하이픈 포맷 ──────────────
     숫자만 입력해도 010-1234-5678 형식으로 자동 변환
  */
  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, ""); // 숫자만 추출
    let formatted = digits;

    if (digits.length <= 3) {
      formatted = digits;
    } else if (digits.length <= 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }

    setForm((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

  /* ── 유효성 검사 ──────────────────────────
     제출 전에 모든 입력값이 올바른지 확인
     에러가 있으면 에러 객체 반환, 없으면 빈 객체 반환
  */
  const validate = () => {
    const newErrors = {};
    const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.userId.trim()) newErrors.userId = "아이디를 입력해주세요";
    else if (form.userId.length < 4) newErrors.userId = "아이디는 4자 이상이어야 합니다";
    else if (/[^a-zA-Z0-9_]/.test(form.userId)) newErrors.userId = "아이디는 영문, 숫자, _ 만 사용 가능합니다";

    if (!form.password) newErrors.password = "비밀번호를 입력해주세요";
    else if (form.password.length < 8) newErrors.password = "비밀번호는 8자 이상이어야 합니다";

    if (!form.passwordConfirm) newErrors.passwordConfirm = "비밀번호를 한 번 더 입력해주세요";
    else if (form.password !== form.passwordConfirm) newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다";

    if (!form.name.trim()) newErrors.name = "이름을 입력해주세요";

    if (!form.phone) newErrors.phone = "전화번호를 입력해주세요";
    else if (!phoneRegex.test(form.phone)) newErrors.phone = "올바른 전화번호 형식이 아닙니다 (010-0000-0000)";

    if (!form.email) newErrors.email = "이메일을 입력해주세요";
    else if (!emailRegex.test(form.email)) newErrors.email = "올바른 이메일 형식이 아닙니다";

    if (!form.address.trim()) newErrors.address = "집 주소를 입력해주세요";

    if (!agree) newErrors.agree = "이용약관에 동의해주세요";

    return newErrors;
  };

  /* ── 폼 제출 핸들러 ─────────────────────────
     현재: 유효성 검사 후 로그인 페이지로 이동 (임시)
     나중에: API 호출 후 로그인 페이지로 이동
  */
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 폼 제출(페이지 새로고침) 방지

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // 첫 번째 에러 필드로 부드럽게 스크롤
      const firstKey = Object.keys(newErrors)[0];
      document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsLoading(true);

    try {
      await register({
        userId: form.userId,
        password: form.password,
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        addressDetail: form.addressDetail,
      });

      alert("회원가입이 완료되었습니다! 로그인 해주세요.");
      navigate("/user/login");
    } catch (err) {
      setErrors({ general: err.message || "회원가입에 실패했습니다. 다시 시도해주세요." });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── 화면 렌더링 ─────────────────────────── */
  return (
    <div className="auth-bg">
      <div className="auth-circle circle-left" />
      <div className="auth-circle circle-right" />

      <div className="auth-card register-card anim-pop">
        {/* 로고 */}
        <div className="auth-logo" onClick={() => navigate("/")}>
          {/* <span className="auth-logo-icon">🧊</span> */}
          <span className="auth-logo-text">Pleege</span>
        </div>

        {/* 타이틀 */}
        <div className="auth-header">
          <h2 className="auth-title">회원가입</h2>
          <p className="auth-sub">정보를 입력하고 서비스를 시작해보세요!</p>
        </div>

        {/* 전체 에러 메시지 (API 에러) */}
        {errors.general && (
          <div className="auth-error-box">
            //⚠️
            {errors.general}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* ── 아이디 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="userId">
              아이디
            </label>
            <div className={`auth-input-wrap ${errors.userId ? "error" : ""}`}>
              {/* <span className="auth-input-icon">👤</span> */}
              <input
                id="userId"
                type="text"
                name="userId"
                className="auth-input"
                placeholder="영문, 숫자, _ 4자 이상"
                value={form.userId}
                onChange={handleChange}
                maxLength={20}
              />
            </div>
            {errors.userId && <p className="auth-field-error">{errors.userId}</p>}
          </div>

          {/* ── 비밀번호 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">
              비밀번호
            </label>
            <div className={`auth-input-wrap ${errors.password ? "error" : ""}`}>
              {/* <span className="auth-input-icon">🔒</span> */}
              <input
                id="password"
                type={showPw ? "text" : "password"}
                name="password"
                className="auth-input"
                placeholder="8자 이상 입력하세요"
                value={form.password}
                onChange={handleChange}
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPw((p) => !p)}>
                {showPw ? "숨기기" : "보이기"}
              </button>
            </div>
            {errors.password && <p className="auth-field-error"> {errors.password}</p>}
          </div>

          {/* ── 비밀번호 확인 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="passwordConfirm">
              비밀번호 확인
            </label>
            <div className={`auth-input-wrap ${errors.passwordConfirm ? "error" : ""}`}>
              {/* <span className="auth-input-icon">🔒</span> */}
              <input
                id="passwordConfirm"
                type={showPwC ? "text" : "password"}
                name="passwordConfirm"
                className="auth-input"
                placeholder="비밀번호를 한 번 더 입력하세요"
                value={form.passwordConfirm}
                onChange={handleChange}
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPwC((p) => !p)}>
                {showPwC ? "숨기기" : "보이기"}
              </button>
            </div>
            {/* 실시간 비밀번호 일치 여부 표시 */}
            {form.passwordConfirm && (
              <p className={form.password === form.passwordConfirm ? "auth-field-ok" : "auth-field-error"}>
                {form.password === form.passwordConfirm ? " 비밀번호가 일치합니다" : " 비밀번호가 일치하지 않습니다"}
              </p>
            )}
            {errors.passwordConfirm && !form.passwordConfirm && (
              <p className="auth-field-error">{errors.passwordConfirm}</p>
            )}
          </div>

          {/* ── 이름 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="name">
              이름
            </label>
            <div className={`auth-input-wrap ${errors.name ? "error" : ""}`}>
              {/* <span className="auth-input-icon">📝</span> */}
              <input
                id="name"
                type="text"
                name="name"
                className="auth-input"
                placeholder="실명을 입력하세요"
                value={form.name}
                onChange={handleChange}
                maxLength={10}
              />
            </div>
            {errors.name && <p className="auth-field-error">{errors.name}</p>}
          </div>

          {/* ── 전화번호 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="phone">
              전화번호
            </label>
            <div className={`auth-input-wrap ${errors.phone ? "error" : ""}`}>
              {/* <span className="auth-input-icon">📱</span> */}
              <input
                id="phone"
                type="text"
                name="phone"
                className="auth-input"
                placeholder="010-0000-0000"
                value={form.phone}
                onChange={handlePhoneChange}
                maxLength={13}
              />
            </div>
            {errors.phone && <p className="auth-field-error">⚠ {errors.phone}</p>}
          </div>

          {/* ── 이메일 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">
              이메일
            </label>
            <div className={`auth-input-wrap ${errors.email ? "error" : ""}`}>
              {/* <span className="auth-input-icon">📧</span> */}
              <input
                id="email"
                type="email"
                name="email"
                className="auth-input"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <p className="auth-field-error"> {errors.email}</p>}
          </div>

          {/* ── 집 주소 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="address">
              집 주소
              <span className="reg-addr-badge"> 가까운 시장 추천에 사용됩니다</span>
            </label>
            <div className={`auth-input-wrap ${errors.address ? "error" : ""}`}>
              {/* <span className="auth-input-icon">🏠</span> */}
              <input
                id="address"
                type="text"
                name="address"
                className="auth-input"
                placeholder="예) 서울시 강남구 테헤란로 123"
                value={form.address}
                onChange={handleChange}
              />
            </div>
            {errors.address && <p className="auth-field-error">⚠ {errors.address}</p>}

            {/* 상세 주소 — 기본 주소 입력 후에만 표시 */}
            {form.address && (
              <div className="auth-input-wrap" style={{ marginTop: "8px" }}>
                {/* <span className="auth-input-icon">🏢</span> */}
                <input
                  type="text"
                  name="addressDetail"
                  className="auth-input"
                  placeholder="상세 주소 입력 (동, 호수 등) - 선택사항"
                  value={form.addressDetail}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* ── 약관 동의 ── */}
          <div className="auth-agree-wrap">
            <input
              id="agree"
              type="checkbox"
              className="auth-agree-checkbox"
              checked={agree}
              onChange={(e) => {
                setAgree(e.target.checked);
                if (errors.agree) setErrors((prev) => ({ ...prev, agree: "" }));
              }}
            />
            <label htmlFor="agree" className="auth-agree-text">
              <a onClick={() => alert("이용약관 내용 준비 중입니다!")}>이용약관</a> 및{" "}
              <a onClick={() => alert("개인정보처리방침 준비 중입니다!")}>개인정보처리방침</a>에 동의합니다
            </label>
          </div>
          {errors.agree && <p className="auth-field-error">⚠ {errors.agree}</p>}

          {/* ── 제출 버튼 ── */}
          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? (
              <span className="auth-loading">
                <span className="auth-spinner" /> 가입 중...
              </span>
            ) : (
              "회원가입 완료"
            )}
          </button>
        </form>

        {/* 로그인으로 이동 */}
        <div className="auth-divider">
          <span>이미 계정이 있으신가요?</span>
        </div>
        <Link to="/user/login" className="auth-link-btn">
          로그인 하기
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
