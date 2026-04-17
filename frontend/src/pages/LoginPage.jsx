import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AuthPage.css';

/* ──────────────────────────────────────────
   LoginPage — 일반 회원 로그인 페이지
   로그인 방식: 아이디 + 비밀번호

   [나중에 백엔드 연결할 부분]
   handleSubmit 함수 안의 주석 처리된 fetch 코드를
   주석 해제하고 API URL만 바꿔주면 됩니다!
   예: POST /api/auth/login  { userId, password }
────────────────────────────────────────── */
const LoginPage = () => {
  const navigate = useNavigate();

  /* ── 상태(State) 관리 ──────────────────────
     useState: 컴포넌트가 기억해야 할 값을 관리
     값이 바뀌면 화면이 자동으로 다시 렌더링됨
  */

  // 폼 입력값 (아이디, 비밀번호를 객체 하나로 관리)
  const [form, setForm] = useState({
    userId: '',
    password: '',
  });

  // 유효성 에러 메시지
  const [errors, setErrors] = useState({});

  // 로딩 상태 (API 호출 중 버튼 중복 클릭 방지용)
  const [isLoading, setIsLoading] = useState(false);

  // 비밀번호 보이기/숨기기 토글
  const [showPw, setShowPw] = useState(false);

  /* ── 입력 변경 핸들러 ───────────────────────
     input의 name 속성을 이용해서 함수 하나로
     모든 input을 처리하는 실무 패턴
  */
  const handleChange = (e) => {
    const { name, value } = e.target;
    // 이전 상태를 복사(...)하고 해당 key만 업데이트
    setForm((prev) => ({ ...prev, [name]: value }));
    // 타이핑 시작하면 해당 에러 메시지 제거
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /* ── 유효성 검사 ──────────────────────────
     제출 전에 입력값이 올바른지 확인
     에러가 있으면 에러 객체 반환, 없으면 빈 객체 반환
  */
  const validate = () => {
    const newErrors = {};

    if (!form.userId.trim()) {
      newErrors.userId = '아이디를 입력해주세요';
    } else if (form.userId.length < 4) {
      newErrors.userId = '아이디는 4자 이상이어야 합니다';
    }

    if (!form.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (form.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다';
    }

    return newErrors;
  };

  /* ── 폼 제출 핸들러 ───────────────────────
     현재: 유효성 검사 후 /user/fridge 로 이동 (임시)
     나중에: API 호출 후 토큰 저장 → 페이지 이동
  */
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 폼 제출(페이지 새로고침) 방지

    // 유효성 검사 실행
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // 에러 있으면 여기서 중단
    }

    setIsLoading(true);

    try {
      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         🔧 백엔드 연결할 때 아래 주석을 해제하세요!

         const response = await fetch('/api/auth/login', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             userId: form.userId,
             password: form.password,
           }),
         });

         const data = await response.json();

         if (!response.ok) {
           throw new Error(data.message || '로그인 실패');
         }

         // 로그인 성공 시 토큰/유저정보 저장
         localStorage.setItem('token', data.token);
         localStorage.setItem('user', JSON.stringify(data.user));
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

      // ▼ 임시 처리: 1초 후 냉장고 페이지로 이동
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate('/user');

    } catch (err) {
      setErrors({ general: err.message || '로그인에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg">

      {/* 배경 장식 원 */}
      <div className="auth-circle circle-left" />
      <div className="auth-circle circle-right" />

      <div className="auth-card anim-pop">

        {/* 로고 — 클릭하면 홈으로 */}
        <div className="auth-logo" onClick={() => navigate('/')}>
          {/* <span className="auth-logo-icon">🧊</span> */}
          <span className="auth-logo-text">Pleege</span>
        </div>

        {/* 타이틀 */}
        <div className="auth-header">
          <h2 className="auth-title">일반 회원 로그인</h2>
          <p className="auth-sub">아이디와 비밀번호를 입력해주세요</p>
        </div>

        {/* 전체 에러 메시지 (API 에러 표시) */}
        {errors.general && (
          <div className="auth-error-box">
            ⚠️ {errors.general}
          </div>
        )}

        {/* 로그인 폼 */}
        <form className="auth-form" onSubmit={handleSubmit}>

          {/* 아이디 입력 필드 */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="userId">
              아이디
            </label>
            <div className={`auth-input-wrap ${errors.userId ? 'error' : ''}`}>
              {/* <span className="auth-input-icon">👤</span> */}
              <input
                id="userId"
                type="text"
                name="userId"
                className="auth-input"
                placeholder="아이디를 입력하세요"
                value={form.userId}
                onChange={handleChange}
                autoComplete="username"
                maxLength={20}
              />
            </div>
            {errors.userId && (
              <p className="auth-field-error">⚠ {errors.userId}</p>
            )}
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">
              비밀번호
            </label>
            <div className={`auth-input-wrap ${errors.password ? 'error' : ''}`}>
              {/* <span className="auth-input-icon">🔒</span> */}
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                name="password"
                className="auth-input"
                placeholder="비밀번호를 입력하세요"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              {/* 비밀번호 보이기/숨기기 버튼 */}
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw((prev) => !prev)}
              >
                {showPw ? '숨기기' : '보이기'}
              </button>
            </div>
            {errors.password && (
              <p className="auth-field-error">⚠ {errors.password}</p>
            )}
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="auth-loading">
                <span className="auth-spinner" /> 로그인 중...
              </span>
            ) : (
              '로그인'
            )}
          </button>

        </form>

        {/* 구분선 */}
        <div className="auth-divider">
          <span>계정이 없으신가요?</span>
        </div>

        {/* 회원가입 이동 버튼 */}
        <Link to="/register" className="auth-link-btn">
          회원가입 하기
        </Link>

        {/* 냉장고 문으로 돌아가기 */}
        <button
          type="button"
          className="auth-switch-btn"
          onClick={() => navigate('/intro')}
        >
          ← 처음으로 돌아가기
        </button>

      </div>
    </div>
  );
};

export default LoginPage;