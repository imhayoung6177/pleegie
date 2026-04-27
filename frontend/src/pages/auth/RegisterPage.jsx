import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/auth/AuthPage.css";
import "../../Styles/auth/RegisterPage.css";
// ✅ [수정후] 실제 서버와 통신하는 register 함수를 가져옵니다.
import { register } from "../../services/authService";

const RegisterPage = () => {
  const navigate = useNavigate();

  // ── 폼 상태 관리 ──────────────────────────
  const [form, setForm] = useState({
    userId: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
    email: "",
    address: "", 
    addressDetail: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPwC, setShowPwC] = useState(false);
  const [agree, setAgree] = useState(false);

  // ── 입력 변경 핸들러 ──────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ── 전화번호 포맷팅 (010-0000-0000) ────────
  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    let formatted = digits;
    if (digits.length <= 3) formatted = digits;
    else if (digits.length <= 7) formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    else formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;

    setForm((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

  // ── 유효성 검사 ──────────────────────────
  const validate = () => {
    const newErrors = {};
    const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.userId.trim()) newErrors.userId = "아이디를 입력해주세요";
    if (!form.password) newErrors.password = "비밀번호를 입력해주세요";
    else if (form.password.length < 8) newErrors.password = "비밀번호는 8자 이상이어야 합니다";
    if (form.password !== form.passwordConfirm) newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다";
    if (!form.name.trim()) newErrors.name = "이름을 입력해주세요";
    if (!phoneRegex.test(form.phone)) newErrors.phone = "올바른 전화번호 형식이 아닙니다";
    if (!emailRegex.test(form.email)) newErrors.email = "올바른 이메일 형식이 아닙니다";
    if (!form.address.trim()) newErrors.address = "주소를 입력해주세요";
    if (!agree) newErrors.agree = "이용약관에 동의해주세요";

    return newErrors;
  };

  // ── 폼 제출 핸들러 (연동 핵심) ──────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // ✅ [수정후] authService를 통해 백엔드 /user/signup 에 데이터를 보냅니다.
      // (수정전) 단순히 navigate("/user/login")만 실행되던 가짜 로직 삭제
      await register(form);

      alert("회원가입이 완료되었습니다! 로그인 해주세요.");
      navigate("/user/login");
    } catch (err) {
      // ✅ [수정후] 백엔드에서 보낸 에러 메시지(아이디 중복 등)를 화면에 띄웁니다.
      setErrors({ general: err.message || "회원가입에 실패했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card register-card anim-pop">
        <div className="auth-logo" onClick={() => navigate("/")}>
          <span className="auth-logo-text">Pleegie</span>
        </div>

        <div className="auth-header">
          <h2 className="auth-title">회원가입</h2>
          <p className="auth-sub">정보를 입력하고 서비스를 시작해보세요!</p>
        </div>

        {/* ✅ [신규] 서버 에러 메시지 출력 영역 */}
        {errors.general && (
          <div className="auth-error-box" style={{ color: 'red', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
            ⚠️ {errors.general}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* 아이디 */}
          <div className="auth-field">
            <label className="auth-label">아이디</label>
            <div className={`auth-input-wrap ${errors.userId ? "error" : ""}`}>
              <input type="text" name="userId" className="auth-input" placeholder="4자 이상 입력" value={form.userId} onChange={handleChange} />
            </div>
            {errors.userId && <p className="auth-field-error">{errors.userId}</p>}
          </div>

          {/* 비밀번호 */}
          <div className="auth-field">
            <label className="auth-label">비밀번호</label>
            <div className={`auth-input-wrap ${errors.password ? "error" : ""}`}>
              <input type={showPw ? "text" : "password"} name="password" className="auth-input" placeholder="8자 이상" value={form.password} onChange={handleChange} />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)}>{showPw ? "숨기기" : "보이기"}</button>
            </div>
            {errors.password && <p className="auth-field-error">{errors.password}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="auth-field">
            <label className="auth-label">비밀번호 확인</label>
            <div className={`auth-input-wrap ${errors.passwordConfirm ? "error" : ""}`}>
              <input type={showPwC ? "text" : "password"} name="passwordConfirm" className="auth-input" value={form.passwordConfirm} onChange={handleChange} />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPwC(!showPwC)}>{showPwC ? "숨기기" : "보이기"}</button>
            </div>
            {errors.passwordConfirm && <p className="auth-field-error">{errors.passwordConfirm}</p>}
          </div>

          {/* 이름 */}
          <div className="auth-field">
            <label className="auth-label">이름</label>
            <div className={`auth-input-wrap ${errors.name ? "error" : ""}`}>
              <input type="text" name="name" className="auth-input" value={form.name} onChange={handleChange} />
            </div>
            {errors.name && <p className="auth-field-error">{errors.name}</p>}
          </div>

          {/* 전화번호 */}
          <div className="auth-field">
            <label className="auth-label">전화번호</label>
            <div className={`auth-input-wrap ${errors.phone ? "error" : ""}`}>
              <input type="text" name="phone" className="auth-input" placeholder="010-0000-0000" value={form.phone} onChange={handlePhoneChange} />
            </div>
            {errors.phone && <p className="auth-field-error">{errors.phone}</p>}
          </div>

          {/* 이메일 */}
          <div className="auth-field">
            <label className="auth-label">이메일</label>
            <div className={`auth-input-wrap ${errors.email ? "error" : ""}`}>
              <input type="email" name="email" className="auth-input" placeholder="example@email.com" value={form.email} onChange={handleChange} />
            </div>
            {errors.email && <p className="auth-field-error">{errors.email}</p>}
          </div>

          {/* 주소 */}
          <div className="auth-field">
            <label className="auth-label">주소</label>
            <div className={`auth-input-wrap ${errors.address ? "error" : ""}`}>
              <input type="text" name="address" className="auth-input" placeholder="서울시..." value={form.address} onChange={handleChange} />
            </div>
            {errors.address && <p className="auth-field-error">{errors.address}</p>}
          </div>

          {/* 이용약관 동의 */}
          <div className="auth-agree-wrap">
            <input id="agree" type="checkbox" className="auth-agree-checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <label htmlFor="agree" className="auth-agree-text">이용약관 및 개인정보처리방침에 동의합니다</label>
          </div>
          {errors.agree && <p className="auth-field-error">{errors.agree}</p>}

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? "가입 중..." : "회원가입 완료"}
          </button>
        </form>

        <div className="auth-divider"><span>이미 계정이 있으신가요?</span></div>
        <Link to="/user/login" className="auth-link-btn">로그인 하기</Link>
      </div>
    </div>
  );
};

export default RegisterPage;