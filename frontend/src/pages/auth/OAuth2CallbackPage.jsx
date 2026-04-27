import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * OAuth2CallbackPage.jsx
 *
 * ✅ 소셜 로그인 흐름:
 *   1. 사용자가 카카오/네이버/구글 버튼 클릭
 *   2. 백엔드 /oauth2/authorization/{provider} 로 이동
 *   3. 소셜 로그인 완료 후 백엔드가 이 페이지로 리다이렉트
 *      → http://localhost:5173/oauth2/callback?token=xxx&role=USER
 *   4. 이 페이지에서 token 추출 → localStorage 저장 → 메인 이동
 *
 * ✅ 백엔드 OAuth2SuccessHandler.java 에서 전달하는 파라미터:
 *   - token: JWT accessToken
 *   - role:  USER / MARKET / ADMIN
 */
export default function OAuth2CallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading / error
  const [errMsg, setErrMsg] = useState('');

useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const role = params.get('role');

    // 디버깅용: 콘솔에 찍어서 데이터가 들어왔는지 꼭 확인하세요!
    console.log("전달받은 토큰:", token);
    console.log("전달받은 역할:", role);

    if (!token) {
      setErrMsg('소셜 로그인 정보를 가져올 수 없습니다.');
      setStatus('error');
      return;
    }

    try {
      // 데이터 저장
      localStorage.setItem('accessToken', token);
      localStorage.setItem('userRole', role || 'USER');

      // 저장 확인 후 이동
      if (role && (role.includes('MARKET') || role.includes('SHOP'))) {
  navigate('/market/main');
} else {
  navigate('/user/fridge');
}
    } catch (error) {
      console.error("저장 중 오류 발생:", error);
      setErrMsg("데이터 저장 중 문제가 발생했습니다.");
      setStatus('error');
    }
  }, [navigate]);

  // ── 로딩 화면 ──
  if (status === 'loading') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: '3rem' }}>⏳</div>
          <h2 style={styles.title}>로그인 처리 중...</h2>
          <p style={styles.sub}>잠시만 기다려주세요</p>
          <div style={styles.spinner} />
        </div>
      </div>
    );
  }

  // ── 에러 화면 ──
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ fontSize: '3rem' }}>❌</div>
        <h2 style={{ ...styles.title, color: '#E53535' }}>로그인 실패</h2>
        <p style={{ ...styles.sub, color: '#E53535' }}>{errMsg}</p>
        <button
          style={styles.btn}
          onClick={() => navigate('/user/login')}
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
  },
  card: {
    background: '#fff',
    borderRadius: '24px',
    padding: '48px 36px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(255,107,53,0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '360px',
    width: '100%',
  },
  title: {
    fontFamily: 'var(--font-title, serif)',
    fontSize: '1.5rem',
    color: '#2a1f0e',
    margin: 0,
    fontWeight: 700,
  },
  sub: {
    fontSize: '0.92rem',
    color: '#8a7a60',
    margin: 0,
  },
  btn: {
    marginTop: '8px',
    padding: '12px 28px',
    background: '#FF6B35',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #ffe8d0',
    borderTop: '3px solid #FF6B35',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};