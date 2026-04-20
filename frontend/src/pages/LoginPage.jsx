import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AuthPage.css';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.withCredentials = true;

/* ──────────────────────────────────────────
   LoginPage — 일반 회원 로그인

   ✅ 변경사항:
   로그인 성공 시 서버에서 받은 userName을
   localStorage.setItem('userName', ...) 으로 저장
   → UserPage에서 localStorage.getItem('userName') 으로 표시
────────────────────────────────────────── */
const LoginPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ userId: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.userId.trim())       newErrors.userId   = '아이디를 입력해주세요';
    else if (form.userId.length < 4) newErrors.userId = '아이디는 4자 이상이어야 합니다';
    if (!form.password)              newErrors.password = '비밀번호를 입력해주세요';
    else if (form.password.length < 6) newErrors.password = '비밀번호는 6자 이상이어야 합니다';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/login',
        { name: form.userId },
        { withCredentials: true }
      );

      if (response.data.success) {
        /* ✅ 핵심: 서버에서 받은 userName을 localStorage에 저장
           → UserPage, TopNav 등 어디서든 꺼내서 사용 가능
           LoginApiController 응답: { success, userId, userName }
        */
        localStorage.setItem('userName', response.data.userName);
        localStorage.setItem('userId',   String(response.data.userId));

        alert(`${response.data.userName}님 환영합니다!`);
        navigate('/user');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      const errorMsg = err.response?.data?.message || '서버와 통신할 수 없습니다.';
      setErrors({ general: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-circle circle-left" />
      <div className="auth-circle circle-right" />

      <div className="auth-card anim-pop">

        <div className="auth-logo" onClick={() => navigate('/')}>
          <span className="auth-logo-text">Pleege</span>
        </div>

        <div className="auth-header">
          <h2 className="auth-title">일반 회원 로그인</h2>
          <p className="auth-sub">아이디와 비밀번호를 입력해주세요</p>
        </div>

        {errors.general && (
          <div className="auth-error-box">⚠️ {errors.general}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>

          {/* 아이디 */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="userId">아이디</label>
            <div className={`auth-input-wrap ${errors.userId ? 'error' : ''}`}>
              <input
                id="userId" type="text" name="userId" className="auth-input"
                placeholder="아이디를 입력하세요"
                value={form.userId} onChange={handleChange}
                autoComplete="username" maxLength={20}
              />
            </div>
            {errors.userId && <p className="auth-field-error">⚠ {errors.userId}</p>}
          </div>

          {/* 비밀번호 */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">비밀번호</label>
            <div className={`auth-input-wrap ${errors.password ? 'error' : ''}`}>
              <input
                id="password" type={showPw ? 'text' : 'password'} name="password"
                className="auth-input" placeholder="비밀번호를 입력하세요"
                value={form.password} onChange={handleChange}
                autoComplete="current-password"
              />
              <button type="button" className="auth-pw-toggle"
                onClick={() => setShowPw((prev) => !prev)}>
                {showPw ? '숨기기' : '보이기'}
              </button>
            </div>
            {errors.password && <p className="auth-field-error">⚠ {errors.password}</p>}
          </div>

          {/* 로그인 버튼 */}
          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading
              ? <span className="auth-loading"><span className="auth-spinner" /> 로그인 중...</span>
              : '로그인'}
          </button>

        </form>

        <div className="auth-divider"><span>계정이 없으신가요?</span></div>
        <Link to="/register" className="auth-link-btn">회원가입 하기</Link>
        <button type="button" className="auth-switch-btn" onClick={() => navigate('/intro')}>
          ← 처음으로 돌아가기
        </button>

      </div>
    </div>
  );
};

export default LoginPage;