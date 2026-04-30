import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/auth/AuthPage.css';
import '../../Styles/user/LocalCurrencyPage.css';

export default function ReportPage() {
  const navigate = useNavigate();
  // 사용자가 선택하는 유형(type)은 로컬 상태로만 관리합니다.
  const [form, setForm] = useState({ type: '불친절/서비스 불만', title: '', content: '' });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // 인증 헤더 설정
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  // 내 신고 내역 불러오기 (GET /user/report) 
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/user/report', { headers: getAuthHeaders() });
      const result = await response.json();
      if (response.ok) {
        // ApiResponse<List<ReportResponse>> 구조에 맞춰 data 추출
        setReports(result.data || []);
      }
    } catch (err) {
      console.error("신고 내역 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 신고 제출하기 (POST /user/report) 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    /**
     * 💡 자바 백엔드 DTO(ReportCreateRequest)에 맞게 데이터 가공
     * 백엔드는 title과 content 필드만 인식하므로 type을 title에 합칩니다. 
     */
    const requestBody = {
      title: `[${form.type}] ${form.title}`, 
      content: form.content
    };

    try {
      const response = await fetch('/user/report', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        alert("소중한 의견이 접수되었습니다.");
        setForm({ type: '불친절/서비스 불만', title: '', content: '' }); // 폼 초기화
        fetchReports(); // 목록 새로고침
      } else {
        const errData = await response.json();
        alert(errData.message || "신고 접수에 실패했습니다.");
      }
    } catch (err) {
      console.error("Report submission failed:", err);
      alert("신고 접수 중 오류가 발생했습니다.");
    }
  };

  // 상태 배지 렌더링 (백엔드 상수는 PENDING, IN_PROGRESS, RESOLVED, REJECTED) 
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':     return <span className="lc-badge requested">접수</span>;
      case 'IN_PROGRESS': return <span className="lc-badge requested">처리 중</span>;
      case 'RESOLVED':    return <span className="lc-badge issued">처리 완료</span>;
      case 'REJECTED':    return <span className="lc-badge rejected">반려</span>;
      default:            return <span className="lc-badge used">{status}</span>;
    }
  };

  return (
    <div className="mypage-subpage">
      <div className="mypage-white-box">
        <div style={{ color: 'black', fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '10px' }}>pleegie</div>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📢 신고 및 불편사항 접수</h2>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">신고 유형</label>
            <select 
              className="auth-input" 
              value={form.type} 
              onChange={e => setForm({...form, type: e.target.value})} 
              style={{ width: '100%' }}
            >
              <option>불친절/서비스 불만</option>
              <option>위생 불량</option>
              <option>가격/정량 미달</option>
              <option>기타</option>
            </select>
          </div>

          <div className="auth-field">
            <label className="auth-label">제목</label>
            <input 
              type="text" 
              className="auth-input" 
              placeholder="제목을 입력하세요" 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">상세 내용</label>
            <textarea 
              className="auth-input" 
              style={{ height: '150px', paddingTop: '12px' }} 
              placeholder="내용을 구체적으로 적어주시면 큰 도움이 됩니다." 
              value={form.content} 
              onChange={e => setForm({...form, content: e.target.value})} 
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="auth-submit-btn" style={{ flex: 1, margin: 0 }} onClick={() => navigate('/user/mypage')}>돌아가기</button>
            <button type="submit" className="auth-submit-btn" style={{ flex: 1, margin: 0 }}>신고하기</button>
          </div>
        </form>

        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', color: '#2a1f0e', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1.5px dashed rgba(0,0,0,0.1)' }}>
            나의 신고 내역
          </h3>
          
          <div className="lc-list">
            {loading ? (
              <p style={{ textAlign: 'center', color: '#aaa', padding: '30px 0' }}>내역을 불러오는 중...</p>
            ) : reports.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa', padding: '30px 0', fontSize: '0.9rem' }}>아직 신고 내역이 없어요.</p>
            ) : (
              reports.map(item => (
                <div key={item.id} className="lc-item" style={{ display: 'block', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#2a1f0e', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                    {renderStatusBadge(item.status)}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#5a4a32', margin: '0 0 10px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {item.content}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#8a7a60', textAlign: 'right' }}>
                    {new Date(item.createdAt).toLocaleDateString('ko-KR')} 접수
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}