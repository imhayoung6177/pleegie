import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/user/MyPage.css';
import '../../Styles/user/LocalCurrencyPage.css';

// ════════════════════════════════════════════════════════
// 📌 API 설정
// ════════════════════════════════════════════════════════
const BASE_URL = '';

// 신청 가능 개수 조회
const fetchAvailableCount = async () => {
    const response = await fetch(`/user/local-currency/available-count`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`개수 조회 실패: ${response.status}`);
    const result = await response.json();
    return result.data ?? 0;
};

// 지역화폐 신청
const applyLocalCurrency = async (userCouponId) => {
    const response = await fetch(`/user/local-currency/apply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userCouponId }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || `신청 실패: ${response.status}`);
    }
    return await response.json();
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// ════════════════════════════════════════════════════════
// 📌 API 함수 모음
// ════════════════════════════════════════════════════════

/**
 * [API 1] ✅ 현재 백엔드에 이미 있음 → 즉시 연동 가능
 * 내 지역화폐 신청 내역 조회
 * GET /user/local-currency/logs
 */
const fetchMyLogs = async () => {
  const response = await fetch(`${BASE_URL}/user/local-currency/logs`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`내역 조회 실패: ${response.status}`);
  const result = await response.json();
  return result.data || [];
};

/**
 * [API 2] ⚠️ 백엔드 미완성 → 404 에러 발생 중
 * 신청 가능한 쿠폰 개수 조회
 * GET /user/coupon/available-count
 *
 * 백엔드 완성 후 아래 주석 해제하고 사용하세요:
 * const fetchAvailableCount = async () => {
 *   const response = await fetch(`${BASE_URL}/user/coupon/available-count`, {
 *     method: 'GET',
 *     headers: getAuthHeaders(),
 *   });
 *   if (!response.ok) throw new Error(`쿠폰 개수 조회 실패: ${response.status}`);
 *   const result = await response.json();
 *   return result.data ?? 0;
 * };
 */

/**
 * [API 3] ⚠️ 백엔드 미완성
 * 지역화폐 신청하기
 * POST /user/local-currency/apply
 *
 * 백엔드 완성 후 아래 주석 해제하고 사용하세요:
 * const applyLocalCurrency = async (requestBody) => {
 *   const response = await fetch(`${BASE_URL}/user/local-currency/apply`, {
 *     method: 'POST',
 *     headers: getAuthHeaders(),
 *     body: JSON.stringify(requestBody),
 *   });
 *   if (!response.ok) {
 *     const err = await response.json();
 *     throw new Error(err.message || `신청 실패: ${response.status}`);
 *   }
 *   return await response.json();
 * };
 */

// ════════════════════════════════════════════════════════
// 📌 헬퍼 함수
// ════════════════════════════════════════════════════════

/** 상태 뱃지 렌더링 */
const renderStatusBadge = (status) => {
  switch (status) {
    case 'REQUESTED': return <span className="lc-badge requested">대기</span>;
    case 'ISSUED':    return <span className="lc-badge issued">승인</span>;
    case 'REJECTED':  return <span className="lc-badge rejected">반려</span>;
    default:          return null;
  }
};

/** 날짜 포맷: "2025-06-02T10:30:00" → "2025-06-02" */
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return dateStr.split('T')[0];
};

// ════════════════════════════════════════════════════════
// 📌 메인 컴포넌트
// ════════════════════════════════════════════════════════
export default function LocalCurrencyPage() {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────
  const [history, setHistory]               = useState([]);
  // ⚠️ availableCount: 백엔드 API 완성 전까지 임시로 0 고정
  //    완성 후 loadData()에서 fetchAvailableCount()로 실제 값을 받아오세요
  const [availableCount, setAvailableCount] = useState(0);
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState(null);
  const [isApplying, setIsApplying]         = useState(false);

  // ── 데이터 로드 ───────────────────────────────────────
  /**
   * ✅ 현재 연동 가능한 것: fetchMyLogs() (내역 조회)
   * ⚠️ 아직 연동 불가: fetchAvailableCount() (쿠폰 개수) → 404 에러 발생
   *
   * 해결 방법:
   * fetchMyLogs()만 호출하고, availableCount는 0으로 유지합니다.
   * 백엔드에서 /user/coupon/available-count API가 완성되면
   * 아래 "TODO 1" 부분의 주석을 해제하면 끝납니다!
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const [logs, count] = await Promise.all([
            fetchMyLogs(),
            fetchAvailableCount(), 
        ]);
        setHistory(logs);
        setAvailableCount(count);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      if (err.message.includes('401')) {
        alert('로그인이 만료되었습니다.');
        navigate('/user/login');
        return;
      }
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── 통계 계산 ─────────────────────────────────────────
  const requestedCount = history.filter(item => item.status === 'REQUESTED').length;
  const issuedCount    = history.filter(item => item.status === 'ISSUED').length;
  const rejectedCount  = history.filter(item => item.status === 'REJECTED').length;

  // ── 신청하기 핸들러 ───────────────────────────────────
  /**
   * ⚠️ TODO 2: 백엔드 /user/local-currency/apply 완성 후
   *    아래 handleApply 함수 전체를 교체하세요!
   *
   * 교체할 코드:
   * const handleApply = async () => {
   *   if (availableCount <= 0) return;
   *   const confirmApply = window.confirm("지역화폐 '5,000원' 권을 신청하시겠습니까?");
   *   if (!confirmApply) return;
   *   setIsApplying(true);
   *   try {
   *     await applyLocalCurrency({ amount: 5000, marketId: 1 });
   *     alert("신청이 완료되었습니다!...");
   *     await loadData();
   *   } catch (err) {
   *     alert(`❌ 신청 중 오류가 발생했습니다.\n${err.message}`);
   *   } finally {
   *     setIsApplying(false);
   *   }
   * };
   *
   * 현재는 임시로 안내 메시지만 표시합니다.
   */
  const handleApply = async () => {
      if (availableCount <= 0) return;

      const confirmApply = window.confirm("지역화폐 '5,000원' 권을 신청하시겠습니까?");
      if (!confirmApply) return;

      setIsApplying(true);
      try {
          // 신청 가능한 첫 번째 UserCoupon으로 신청
          const completedCoupon = await fetch('/user/coupons', {
              headers: getAuthHeaders()
          }).then(r => r.json());

          const targetCoupon = completedCoupon.data.find(c => c.isCompleted);
          if (!targetCoupon) {
              alert('신청 가능한 쿠폰이 없습니다.');
              return;
          }

          await applyLocalCurrency(targetCoupon.id);
          alert('신청이 완료되었습니다!\n관리자 승인 후 문자로 발송됩니다.');
          await loadData();
      } catch (err) {
          alert(`신청 중 오류가 발생했습니다.\n${err.message}`);
      } finally {
          setIsApplying(false);
      }
  };

  // ════════════════════════════════════════════════════
  // 📌 렌더링 - 원본 디자인 완전 동일
  // ════════════════════════════════════════════════════
  return (
    <div className="mypage-subpage">
      <div className="mypage-white-box">

        {/* 헤더 타이틀 */}
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: 'black', fontWeight: 700, marginBottom: '8px' }}>
          pleegie
        </div>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: '#2a1f0e', margin: '0 0 4px' }}>
            💸 지역화폐 신청
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#8a7a60', margin: 0 }}>
            스탬프 10개로 5,000원 지역화폐를 받으세요!
          </p>
        </div>

        {/* 로딩 */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8a7a60' }}>
            <p style={{ margin: 0 }}>⏳ 불러오는 중...</p>
          </div>
        )}

        {/* 에러 */}
        {!isLoading && error && (
          <div style={{ background: '#ffebee', border: '1.5px solid #E53535', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ color: '#E53535', margin: '0 0 12px' }}>⚠️ {error}</p>
            <button onClick={loadData} style={{ background: '#E53535', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer' }}>
              다시 시도
            </button>
          </div>
        )}

        {/* 정상 콘텐츠 */}
        {!isLoading && !error && (
          <>
            {/* 신청 현황 요약 카드 */}
            <div className="lc-summary" style={{ padding: '20px' }}>
              <div className="lc-title" style={{ marginBottom: '16px', fontWeight: 'bold',fontSize: '1.2rem'}}>
                나의 신청 현황
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.95rem', color: '#5a4a32' }}>승인 완료</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4CAF50' }}>{issuedCount}건</span>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.1)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.95rem', color: '#5a4a32' }}>승인 대기</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2a1f0e' }}>{requestedCount}건</span>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.1)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.95rem', color: '#5a4a32' }}>반려</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#E53535' }}>{rejectedCount}건</span>
                </div>
              </div>
            </div>

            {/* 신청 가능 박스 */}
            <div className="lc-apply-box">
              <div className="lc-apply-info">
                지역화폐 신청 가능 : <span>{availableCount}</span> 장
              </div>
              <button
                className="lc-apply-btn"
                onClick={handleApply}
                disabled={availableCount <= 0 || isApplying}
              >
                {isApplying
                  ? '신청 중...'
                  : availableCount > 0
                  ? '지역화폐 5,000원 신청하기'
                  : '스탬프를 더 모아주세요!'}
              </button>
            </div>

            {/* 신청 내역 리스트 */}
            <div style={{ marginTop: '10px', flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', color: '#2a1f0e', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1.5px dashed rgba(0,0,0,0.1)' }}>
                신청 내역
              </h3>
              <div className="lc-list">
                {history.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#aaa', padding: '30px 0', fontSize: '0.9rem' }}>
                    아직 신청 내역이 없어요.
                  </p>
                ) : (
                  history.map(item => (
                    <div key={item.id} className="lc-item" style={{ padding: '10px 16px', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ fontSize: '1rem', color: '#2a1f0e', fontWeight: 600 }}>
                          {formatDate(item.requestedAt)}
                        </div>
                        <div style={{ color: '#2a1f0e', fontWeight: 700, fontSize: '1rem' }}>
                          {item.amount?.toLocaleString()}원
                        </div>
                      </div>
                      <div>{renderStatusBadge(item.status)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        <button
          className="auth-submit-btn"
          style={{ marginTop: '24px', width: '100%' }}
          onClick={() => navigate('/user/mypage')}
        >
          뒤로 가기
        </button>

      </div>
    </div>
  );
}