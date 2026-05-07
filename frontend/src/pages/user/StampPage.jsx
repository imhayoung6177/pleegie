import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/user/MyPage.css';

export default function StampPage() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  //  /user/stamp/history → /user/coupons (시장별 UserCoupon 조회)
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch('/user/coupons', { headers: getAuthHeaders() });
        const result = await response.json();
        if (response.ok) {
          setCoupons(result.data || []);
        }
      } catch (err) {
        console.error("쿠폰 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  if (loading) return (
    <div className="mypage-subpage" style={{ color: 'white' }}>로딩 중...</div>
  );

  return (
    <div className="mypage-subpage">
      <div className="mypage-white-box" style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-title)', color: '#2a1f0e' }}>🎫 나의 스탬프 현황</h2>

        {coupons.length === 0 ? (
          <div style={{ padding: '40px', color: '#8a7a60' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏪</div>
            <p>아직 방문한 시장이 없어요<br />QR을 스캔해서 스탬프를 모아보세요!</p>
          </div>
        ) : (
          // 시장별로 각각의 도장판 렌더링
          coupons.map(coupon => (
            <div key={coupon.id} className="stamp-board"
              style={{ margin: '16px 0', padding: '20px', background: '#fdfcf0', borderRadius: '15px', textAlign: 'left' }}>

              {/* 시장명 + 완료 뱃지 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#2a1f0e' }}>
                  🏪 {coupon.marketName}
                </div>
                {coupon.isCompleted && (
                  <span style={{
                    background: '#fdd537', color: '#2a1f0e',
                    borderRadius: '999px', padding: '2px 10px',
                    fontSize: '0.78rem', fontWeight: 700
                  }}>
                    ✅ 완료
                  </span>
                )}
              </div>

              {/* 스탬프 카운트 */}
              <div style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#8a7a60' }}>
                현재 적립:
                <span style={{ color: '#fdd537', fontWeight: 700, marginLeft: '6px' }}>
                  {coupon.stampCount} / {coupon.requiredStampCount}
                </span>
              </div>

              {/* 도장판 */}
              <div className="stamp-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px'
              }}>
                {Array.from({ length: coupon.requiredStampCount }).map((_, i) => (
                  <div key={i}
                    style={{
                      height: '48px',
                      background: i < coupon.stampCount ? '#fdd537' : '#eee',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.3rem',
                      transition: 'background 0.2s',
                    }}>
                    {i < coupon.stampCount ? '💮' : ''}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', width: '100%' }}>
          <button className="auth-submit-btn" style={{ flex: 1, margin: 0 }}
            onClick={() => navigate('/user/mypage')}>
            돌아가기
          </button>
          <button className="auth-submit-btn" style={{ flex: 1, margin: 0 }}
            onClick={() => navigate('/user/coupons')}>
            내 쿠폰함 바로가기
          </button>
        </div>
      </div>
    </div>
  );
}