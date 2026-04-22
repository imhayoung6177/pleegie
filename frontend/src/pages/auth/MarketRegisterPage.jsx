import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/auth/AuthPage.css"; 
import "../../Styles/auth/MarketRegisterPage.css"; 

const MarketRegisterPage = ({ role }) => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false); // 사업자 인증 여부

  const [form, setForm] = useState({
    userId: "",
    password: "",
    confirmPassword: "", // 비밀번호 확인 추가
    bizNumber: "",       // 사업자 등록 번호
    marketName: "",      // 상호명
    ownerName: "",       // 대표자명
  });

  // 🚀 사업자 번호 인증 핸들러 (현재는 목데이터로 무조건 통과)
  const handleVerifyBiz = () => {
    /* [백엔드 연동 포인트]
       나중에 실제 API를 사용할 때는 아래 주석을 해제하고 연동하세요.
       const response = await axios.post('/api/verify-biz', { bizNumber: form.bizNumber });
       if (response.data.valid) { ... }
    */

    // 테스트용: 번호를 입력하지 않아도 혹은 아무 번호나 입력해도 통과되게 설정
    if (form.bizNumber.trim().length > 0) {
      alert("사업자 인증에 성공하였습니다! (테스트 모드)");
      setIsVerified(true);
    } else {
      alert("사업자 번호를 입력해주세요.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isVerified) {
      alert("사업자 인증을 먼저 완료해주세요.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 회원가입 완료 로직 (백엔드 연동 전까지 콘솔 확인용)
    console.log("상인 회원가입 데이터:", form);
    alert("상인 회원가입이 완료되었습니다!");
    navigate("/market/login");
  };

  return (
    <div className="auth-bg market-theme">
      <div className="auth-card register-card anim-pop">
        <h2 className="auth-title">상인 회원가입</h2>
        <p className="auth-sub">안전한 거래를 위해 사업자 인증이 필요합니다.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* 1. 사업자 등록 번호 */}
          <div className="auth-field">
            <label className="auth-label">사업자 등록 번호</label>
            <div className="verify-row">
              <input
                type="text"
                name="bizNumber"
                className={`auth-input ${isVerified ? "readonly" : "editable"}`}
                placeholder="'-' 제외 10자리 입력"
                value={form.bizNumber}
                onChange={handleChange}
                readOnly={isVerified}
              />
              <button 
                type="button" 
                className="verify-btn" 
                onClick={handleVerifyBiz}
                disabled={isVerified}
              >
                {isVerified ? "인증완료" : "조회하기"}
              </button>
            </div>
          </div>

          {/* 2. 상호명 (인증 후 입력 가능) */}
          <div className="auth-field">
            <label className="auth-label">상호명</label>
            <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
              <input
                type="text"
                name="marketName"
                className="auth-input"
                placeholder={isVerified ? "가게 이름을 입력하세요" : "인증 후 입력 가능"}
                value={form.marketName}
                onChange={handleChange}
                readOnly={!isVerified}
              />
            </div>
          </div>

          {/* 3. 아이디 */}
          <div className="auth-field">
            <label className="auth-label">아이디</label>
            <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
              <input 
                type="text" 
                name="userId" 
                className="auth-input" 
                onChange={handleChange} 
                readOnly={!isVerified}
                placeholder="사용할 아이디 입력"
              />
            </div>
          </div>

          {/* 4. 비밀번호 (새로 추가) */}
          <div className="auth-field">
            <label className="auth-label">비밀번호</label>
            <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
              <input 
                type="password" 
                name="password" 
                className="auth-input" 
                onChange={handleChange} 
                readOnly={!isVerified}
                placeholder="비밀번호 입력"
              />
            </div>
          </div>

          {/* 5. 비밀번호 확인 (새로 추가) */}
          <div className="auth-field">
            <label className="auth-label">비밀번호 확인</label>
            <div className={`auth-input-wrap ${!isVerified ? "readonly" : "editable"}`}>
              <input 
                type="password" 
                name="confirmPassword" 
                className="auth-input" 
                onChange={handleChange} 
                readOnly={!isVerified}
                placeholder="비밀번호 재입력"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn market" 
            disabled={!isVerified}
          >
            상인 가입 신청하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default MarketRegisterPage;