import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/user/MyPage.css';

export default function StampPage() {
  const navigate = useNavigate();
  const [stamps, setStamps] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  // ✅ [조회] 페이지 진입 시 스탬프 이력 가져오기
  useEffect(() => {
    const fetchStamps = async () => {
      try {
        const response = await fetch('/user/stamp/history', { headers: getAuthHeaders() });
        const result = await response.json();
        if (response.ok) {
          setStamps(result.data || []);
        }
      } catch (err) {
        console.error("스탬프 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStamps();
  }, []);

  // ✅ [참고] 만약 버튼을 눌러 도장을 찍는다면? (시장 상세페이지용 로직)
  const handleCreateStamp = async (marketId) => {
    try {
      // 💡 백엔드 컨트롤러가 @RequestParam을 사용하므로 URL 뒤에 쿼리스트링으로 붙여야 합니다.
      const response = await fetch(`/user/stamp?marketId=${marketId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const result = await response.json();
      if (response.ok) alert(result.message);
    } catch (err) { console.error(err); }
  };

  const currentCount = stamps.length % 10;

  if (loading) return <div className="mypage-subpage" style={{color:'white'}}>로딩 중...</div>;

  return (
    <div className="mypage-subpage">
      <div className="mypage-white-box" style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-title)', color: '#2a1f0e' }}>🎫 나의 스탬프 현황</h2>
        
        <div className="stamp-board" style={{ margin: '30px 0', padding: '20px', background: '#fdfcf0', borderRadius: '15px' }}>
          <div style={{ marginBottom: '15px', fontWeight: 700 }}>
            현재 적립: <span style={{ color: '#FF6B35' }}>{currentCount} / 10</span>
          </div>
          <div className="stamp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`stamp-cell ${i < currentCount ? 'filled' : ''}`} 
                   style={{ 
                     height: '50px', 
                     background: i < currentCount ? '#FF6B35' : '#eee', 
                     borderRadius: '50%', 
                     display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' 
                   }}>
                {i < currentCount ? '💮' : ''}
              </div>
            ))}
          </div>
        </div>

        <button className="auth-submit-btn" onClick={() => navigate('/user/coupons')}>
          내 쿠폰함 바로가기
        </button>
        <button className="auth-link-btn" style={{marginTop: '10px'}} onClick={() => navigate('/user/mypage')}>
          마이페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}