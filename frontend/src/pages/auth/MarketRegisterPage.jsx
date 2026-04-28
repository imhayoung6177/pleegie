import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/auth/AuthPage.css";
import "../../Styles/auth/RegisterPage.css";

// ✅ [연동 추가] 상인 회원가입 & 사업자 인증 API 함수 import
// → marketService.js 에 아래 두 함수를 만들어야 함 (하단 authService 참고)
// import { verifyBizNumber, registerMarket } from "../../services/MarketService.js"; // 임시중단
import { registerMarket } from "../../services/MarketService.js";

const MarketRegisterPage = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);

  // ✅ [연동 추가] 사업자 인증 후 서버에서 받아온 데이터를 저장하는 state
  // → verifiedBizData: { bizName, ceoName } 형태로 자동 채워줄 용도
  // const [verifiedBizData, setVerifiedBizData] = useState(null);

  const [form, setForm] = useState({
    userId: "",
    password: "",
    confirmPassword: "",
    bizNumber: "",
    marketName: "",
    ownerName: "",
    phone: "",
    address: "",
    // ✅ [연동 추가] 백엔드 MarketCreateRequest 에 필요한 위/경도 필드 추가
    // → 추후 지도 API(카카오/네이버)와 연동 시 자동 입력될 예정
    latitude: "",
    longitude: "",
  });

  const [errors, setErrors] = useState({});
  const [showPw,  setShowPw]  = useState(false);
  const [showPwC, setShowPwC] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // ✅ [연동 추가] 사업자 인증 요청 중 로딩 상태 분리
  // → 메인 submit 버튼과 인증 버튼의 로딩을 각각 관리
  const [isBizLoading, setIsBizLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // 전화번호 자동 하이픈
  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    let formatted = digits;
    if (digits.length <= 3) formatted = digits;
    else if (digits.length <= 7) formatted = `${digits.slice(0,3)}-${digits.slice(3)}`;
    else formatted = `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7,11)}`;
    setForm(prev => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
  };

  // ✅ [연동] 사업자 번호 인증 → 실제 공공 API or 자체 백엔드로 교체
  // → 백엔드: POST /auth/biz-verify { bizNumber }
  // → 성공 시 응답: { bizName: "홍길동 식품", ceoName: "홍길동" }
const handleVerifyBiz = async () => {
  if (!form.bizNumber.trim()) {
    setErrors(prev => ({ ...prev, bizNumber: "사업자 번호를 입력해주세요" }));
    return;
  }

  // ✅ 임시: API 호출 없이 바로 인증 성공 처리
  // 🔴 나중에 실제 API 연동할 때 이 블록을 제거하고
  //    아래 주석처리된 try/catch 블록을 살려야 함
  setIsVerified(true);
  setErrors(prev => ({ ...prev, bizNumber: "" }));

  // 🔴 실제 API 연동 시 아래 코드로 교체
  // setIsBizLoading(true);
  // try {
  //   const result = await verifyBizNumber(form.bizNumber);
  //   setIsVerified(true);
  //   setVerifiedBizData(result);
  //   setErrors(prev => ({ ...prev, bizNumber: "" }));
  //   if (result.bizName) setForm(prev => ({ ...prev, marketName: result.bizName }));
  //   if (result.ceoName) setForm(prev => ({ ...prev, ownerName: result.ceoName }));
  // } catch (err) {
  //   setErrors(prev => ({
  //     ...prev,
  //     bizNumber: err.message || "사업자 인증에 실패했습니다."
  //   }));
  // } finally {
  //   setIsBizLoading(false);
  // }
};

  const validate = () => {
    const newErrors = {};
    const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;

    if (!isVerified)             newErrors.bizNumber       = "사업자 인증을 먼저 완료해주세요";
    if (!form.marketName.trim()) newErrors.marketName      = "상호명을 입력해주세요";
    if (!form.ownerName.trim())  newErrors.ownerName       = "대표자명을 입력해주세요";

    if (!form.userId.trim())         newErrors.userId = "아이디를 입력해주세요";
    else if (form.userId.length < 4) newErrors.userId = "아이디는 4자 이상이어야 합니다";
    else if (/[^a-zA-Z0-9_]/.test(form.userId)) newErrors.userId = "영문, 숫자, _ 만 사용 가능합니다";

    if (!form.password)              newErrors.password = "비밀번호를 입력해주세요";
    else if (form.password.length < 8) newErrors.password = "비밀번호는 8자 이상이어야 합니다";

    if (!form.confirmPassword) newErrors.confirmPassword = "비밀번호를 한 번 더 입력해주세요";
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";

    if (!form.phone)                       newErrors.phone = "전화번호를 입력해주세요";
    else if (!phoneRegex.test(form.phone)) newErrors.phone = "올바른 전화번호 형식이 아닙니다 (010-0000-0000)";

    if (!form.address.trim()) newErrors.address = "사업장 주소를 입력해주세요";

    // ✅ [연동 추가] 위/경도 검증
    // → 지도 API 연동 전까지는 주소 입력 후 좌표 자동 변환 예정
    // → 현재는 필수값 검사 생략 (추후 활성화)
    // if (!form.latitude || !form.longitude) newErrors.address = "주소 검색으로 좌표를 설정해주세요";

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
      // ✅ [연동] 실제 회원가입 API 호출
      // → 백엔드: POST /auth/signup (회원 생성) + POST /market/signup (시장 등록)
      // → registerMarket 내부에서 두 단계를 처리하거나,
      //   백엔드가 한 번에 처리하는 통합 엔드포인트를 사용
      // → 전송 데이터: MarketCreateRequest 스펙에 맞춰 구성
      await registerMarket({
        // 회원 정보
        userId:          form.userId,
        password:        form.password,
        phone:           form.phone,
        // 시장 정보 (MarketCreateRequest 필드명과 일치시킴)
        name:            form.marketName,
        ceoName:         form.ownerName,
        businessNumber:  form.bizNumber,
        latitude:        parseFloat(form.latitude)  || 0,
        longitude:       parseFloat(form.longitude) || 0,
      });

      // ✅ [이전 코드 주석처리] console.log + alert 방식 제거
      // → 테스트용 임시 코드, 실제 API 연동 후 불필요
      // console.log("상인 회원가입 데이터:", form);
      // alert("상인 회원가입이 완료되었습니다!");

      // ✅ [연동 추가] 가입 완료 후 로그인 페이지로 이동 + 성공 메시지 전달
      navigate("/market/login", {
        state: { successMessage: "회원가입이 완료되었습니다! 승인 후 로그인 가능합니다." }
      });

    } catch (err) {
      setErrors({ general: err.message || "회원가입에 실패했습니다." });
    } finally {
      setIsLoading(false);
    }
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
              {/* ✅ [연동] 버튼 텍스트에 로딩 상태 반영 */}
              <button
                type="button"
                className="reg-addr-btn"
                onClick={handleVerifyBiz}
                disabled={isVerified || isBizLoading}
                style={{ opacity: isVerified ? 0.6 : 1 }}
              >
                {isVerified ? "✅ 인증완료" : isBizLoading ? "인증 중..." : "조회하기"}
              </button>
            </div>
            {errors.bizNumber && <p className="auth-field-error">⚠ {errors.bizNumber}</p>}
          </div>

          {/* ── 2. 상호명 ── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="marketName">상호명</label>
            {/* ✅ [연동] 인증 성공 시 서버에서 받은 값이 자동으로 채워짐 */}
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
            {/* ✅ [연동] 인증 성공 시 서버에서 받은 값이 자동으로 채워짐 */}
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
          {/* ✅ [연동] 추후 카카오/네이버 지도 API 붙이면 주소 → 위도/경도 자동 변환 예정 */}
          {/* 현재는 텍스트 직접 입력 방식 유지 */}
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