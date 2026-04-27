import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

/**
 * QrScanPage.jsx
 *
 * ✅ QR 스캔 흐름:
 *   1. 상인 QR에 담긴 URL: /market/scan/{marketId}
 *   2. 고객이 QR 스캔 → 이 페이지 열림
 *   3. 로그인 안 했으면 → 로그인 페이지로 이동 (로그인 후 다시 돌아옴)
 *   4. POST /user/stamp?marketId={marketId} 호출
 *   5. 결과 화면 표시 (성공 / 이미 찍음 / 오류)
 *
 * ✅ 백엔드 StampController 분석:
 *   POST /user/stamp?marketId={marketId}
 *   → @AuthenticationPrincipal 로 userId 자동 추출
 *   → 오늘 이미 찍었으면 ALREADY_STAMPED 에러
 *   → UserCoupon 없으면 COUPON_NOT_FOUND 에러
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
//http://localhost:8080

export default function QrScanPage() {
  // ✅ URL 파라미터에서 marketId 추출
  // → 라우트: /market/scan/:marketId
  const { marketId } = useParams();
  const navigate     = useNavigate();

  // 상태: loading / success / already / error
  const [status,  setStatus]  = useState('loading');
  const [result,  setResult]  = useState(null);
  const [errMsg,  setErrMsg]  = useState('');

  useEffect(() => {
    const doStamp = async () => {
      const token = localStorage.getItem('accessToken');

      // ✅ 로그인 안 했으면 로그인 페이지로 이동
      // → 로그인 후 다시 이 페이지로 돌아올 수 있도록 redirect 파라미터 전달
      if (!token) {
        navigate(`/user/login?redirect=/market/scan/${marketId}`);
        return;
      }

      try {
        // ✅ [연동] POST /user/stamp?marketId={marketId}
        // → StampController.createStamp() 호출
        // → 헤더에 JWT 토큰 첨부 (userId 자동 추출됨)
        const res = await fetch(
          `${BASE_URL}/user/stamp?marketId=${marketId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const contentType = res.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        const json = isJson ? await res.json() : {};

        if (res.ok) {
          // ✅ 스탬프 적립 성공
          setResult(json.data);
          setStatus('success');

        } else {
          // ✅ 백엔드 에러 코드별 처리
          const msg = json.message || '';

          if (msg.includes('ALREADY_STAMPED') || res.status === 409) {
            // → 오늘 이미 스탬프 찍은 경우
            setStatus('already');

          } else if (msg.includes('COUPON_NOT_FOUND')) {
            // → UserCoupon이 없는 경우 (쿠폰 발급이 안 된 상태)
            setErrMsg('이 시장의 쿠폰이 아직 발급되지 않았어요.');
            setStatus('error');

          } else if (res.status === 401) {
            // → 토큰 만료
            localStorage.removeItem('accessToken');
            navigate(`/user/login?redirect=/market/scan/${marketId}`);

          } else {
            setErrMsg(msg || '스탬프 적립에 실패했습니다.');
            setStatus('error');
          }
        }

      } catch (err) {
        setErrMsg('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        setStatus('error');
      }
    };

    doStamp();
  }, [marketId, navigate]);

  /* ── 로딩 화면 ── */
  if (status === 'loading') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconWrap}>⏳</div>
          <h2 style={styles.title}>스탬프 적립 중...</h2>
          <p style={styles.sub}>잠시만 기다려주세요</p>
          {/* 로딩 스피너 */}
          <div style={styles.spinner} />
        </div>
      </div>
    );
  }

  /* ── 성공 화면 ── */
  if (status === 'success') {
    // ✅ result는 현재 null (백엔드가 Void 반환)
    // → 추후 백엔드에서 UserCoupon 정보를 반환하면 활용 가능
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ ...styles.iconWrap, fontSize: '3.5rem' }}>🎉</div>
          <h2 style={{ ...styles.title, color: '#FF6B35' }}>
            스탬프 적립 완료!
          </h2>
          <p style={styles.sub}>방문해 주셔서 감사합니다 😊</p>

          {/* ✅ 스탬프 현황 안내
              백엔드가 Void 반환이라 현재 개수를 모름
              → 추후 UserCoupon 정보 반환 시 표시 가능 */}
          <div style={styles.stampBox}>
            <div style={styles.stampIcon}>🏪</div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#5a4a32' }}>
              스탬프가 적립되었어요!<br />
              <span style={{ fontSize: '0.8rem', color: '#8a7a60' }}>
                내 쿠폰함에서 현황을 확인하세요
              </span>
            </p>
          </div>

          <div style={styles.btnGroup}>
            <button
              style={styles.btnPrimary}
              onClick={() => navigate('/user/coupons')}
            >
              🎫 내 쿠폰 확인하기
            </button>
            <button
              style={styles.btnSecondary}
              onClick={() => navigate('/user/main')}
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 오늘 이미 찍은 경우 ── */
  if (status === 'already') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconWrap}>📅</div>
          <h2 style={styles.title}>오늘은 이미 적립했어요!</h2>
          <p style={styles.sub}>
            하루에 1번만 스탬프를 적립할 수 있어요.<br />
            내일 다시 방문해주세요 😊
          </p>

          <div style={styles.btnGroup}>
            <button
              style={styles.btnPrimary}
              onClick={() => navigate('/user/coupons')}
            >
              🎫 내 쿠폰 확인하기
            </button>
            <button
              style={styles.btnSecondary}
              onClick={() => navigate('/user/main')}
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 에러 화면 ── */
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>❌</div>
        <h2 style={styles.title}>적립 실패</h2>
        <p style={{ ...styles.sub, color: '#E53535' }}>
          {errMsg || '알 수 없는 오류가 발생했습니다.'}
        </p>

        <div style={styles.btnGroup}>
          <button
            style={styles.btnPrimary}
            onClick={() => {
              setStatus('loading');
              setErrMsg('');
              // 다시 시도
              window.location.reload();
            }}
          >
            다시 시도하기
          </button>
          <button
            style={styles.btnSecondary}
            onClick={() => navigate('/user/main')}
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   스타일
══════════════════════════════════════════════════════════ */
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #fff8ee 0%, #ffe8d0 100%)',
    padding: '20px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '40px 32px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(255, 107, 53, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '360px',
    width: '100%',
  },
  iconWrap: {
    fontSize: '3rem',
    lineHeight: 1,
    marginBottom: '4px',
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
    lineHeight: 1.6,
  },
  stampBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#fff8ee',
    borderRadius: '14px',
    padding: '16px 20px',
    width: '100%',
    border: '1.5px solid rgba(255,107,53,0.2)',
  },
  stampIcon: {
    fontSize: '2rem',
    flexShrink: 0,
  },
  btnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    marginTop: '8px',
  },
  btnPrimary: {
    padding: '14px',
    background: '#FF6B35',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
  },
  btnSecondary: {
    padding: '12px',
    background: 'transparent',
    color: '#8a7a60',
    border: '1.5px solid #ddd',
    borderRadius: '14px',
    fontSize: '0.92rem',
    cursor: 'pointer',
    width: '100%',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #ffe8d0',
    borderTop: '3px solid #FF6B35',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginTop: '8px',
  },
};