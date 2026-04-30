import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/user/MyPage.css';
import '../../Styles/user/LocalCurrencyPage.css';

export default function LocalCurrencyPage() {
  const navigate = useNavigate();

  let now = new Date();


  // ✅ 목업 데이터 (추후 백엔드 API로 교체 예정)
  const [availableCount, setAvailableCount] = useState(2); // 10개 모인 스탬프 쿠폰 개수
  const [history, setHistory] = useState([
    { id: 1, date: '2023-11-01', amount: 5000, status: 'REQUESTED' },
    { id: 2, date: '2023-10-25', amount: 10000, status: 'ISSUED' },
    { id: 3, date: '2023-10-15', amount: 5000, status: 'REJECTED' },
  ]);

  // 상태 뱃지 렌더링 헬퍼
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'REQUESTED': return <span className="lc-badge requested">대기</span>;
      case 'ISSUED':    return <span className="lc-badge issued">승인</span>;
      // case 'USED':      return <span className="lc-badge used">사용 완료</span>;
      case 'REJECTED':  return <span className="lc-badge rejected">반려</span>;
      default:          return null;
    }
  };

  const handleApply = () => {
    if (availableCount <= 0) return;
    
    // 백엔드 연동 전 임시 신청 로직
    const confirmApply = window.confirm("지역화폐 '5,000원' 권을 신청하시겠습니까?");
    if (confirmApply) {
      setAvailableCount(prev => prev - 1);
      const newRecord = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        amount: 5000,
        status: 'REQUESTED'
      };
      setHistory([newRecord, ...history]);
      alert(":::::::신청이 완료되었습니다!::::::: \n\n관리자 승인까지는 금일 기준 최대 3영업일 정도 걸리며 , \n지역화폐는 '핸드폰 문자'로 보내드립니다. \n\n:::문자가 안올시 고객센터로 문의 바랍니다:::");
    }
  };

  // ✅ 신청 상태별 카운트 계산
  const requestedCount = history.filter(item => item.status === 'REQUESTED').length;
  const issuedCount = history.filter(item => item.status === 'ISSUED').length;
  const rejectedCount = history.filter(item => item.status === 'REJECTED').length;

  return (
    <div className="mypage-subpage">
      <div className="mypage-white-box">
        {/* 헤더 타이틀 */}
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: 'black', fontWeight: 700, marginBottom: '8px' }}>
          pleegie
        </div>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: '#2a1f0e', margin: '0 0 4px' }}>💸 지역화폐 신청</h2>
          <p style={{ fontSize: '0.85rem', color: '#8a7a60', margin: 0 }}>스탬프 10개로 5,000원 지역화폐를 받으세요!</p>
        </div>

        {/* 신청 현황 요약 카드 */}
        <div className="lc-summary" style={{ padding: '20px' }}>
          <div className="lc-title" style={{ marginBottom: '16px', fontWeight: 'bold' }}>나의 신청 현황</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#5a4a32' }}>승인 완료</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4CAF50' }}>{issuedCount}건</span>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.1)' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#5a4a32' }}>승인 대기</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2a1f0e' }}>{requestedCount}건</span>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.1)' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: '#5a4a32' }}>반려</span>
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
            disabled={availableCount <= 0}
          >
            {availableCount > 0 ? '지역화폐 5,000원 신청하기' : '스탬프를 더 모아주세요!'}
          </button>
        </div>

        {/* 신청 내역 리스트 */}
        <div style={{ marginTop: '10px', flex: 1 }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', color: '#2a1f0e', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1.5px dashed rgba(0,0,0,0.1)' }}>
            신청 내역
          </h3>
          
          <div className="lc-list">
            {history.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa', padding: '30px 0', fontSize: '0.9rem' }}>아직 신청 내역이 없어요.</p>
            ) : (
              history.map(item => (
                <div key={item.id} className="lc-item" style={{ padding: '10px 16px', justifyContent: 'space-between' }}>
                  {/* 좌측: 날짜 + 금액 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontSize: '1rem', color: '#2a1f0e', fontWeight: 600 }}>
                      {item.date}
                    </div>
                    <div style={{ color: '#2a1f0e', fontWeight: 700, fontSize: '1.15rem' }}>
                      {item.amount.toLocaleString()}원
                    </div>
                  </div>
                  {/* 우측: 뱃지 */}
                  <div>
                    {renderStatusBadge(item.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <button className="auth-link-btn" style={{ marginTop: '24px' }} onClick={() => navigate('/user/mypage')}>뒤로 가기</button>
      </div>
    </div>
  );
}