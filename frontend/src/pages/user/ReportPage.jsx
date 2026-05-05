import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/auth/AuthPage.css';
import '../../Styles/user/LocalCurrencyPage.css';

export default function ReportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ type: '불친절/서비스 불만', title: '', content: '' });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/user/report', { headers: getAuthHeaders() });
      const result = await response.json();
      if (response.ok) {
        setReports(result.data || []);
      }
    } catch (err) {
      console.error("신고 내역 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
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
        setForm({ type: '불친절/서비스 불만', title: '', content: '' });
        fetchReports();
      } else {
        const errData = await response.json();
        alert(errData.message || "신고 접수에 실패했습니다.");
      }
    } catch (err) {
      console.error("Report submission failed:", err);
      alert("신고 접수 중 오류가 발생했습니다.");
    }
  };

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
              style={{
                width: '100%', padding: '16px',
                border: '2px solid #fdd537', borderRadius: '16px',
                backgroundColor: '#fffbfa', fontSize: '0.95rem',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
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
              style={{
                width: '100%', padding: '16px',
                border: '2px solid #fdd537', borderRadius: '16px',
                backgroundColor: '#fffbfa', fontSize: '0.95rem',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">상세 내용</label>
            <textarea
              className="auth-input"
              style={{
                height: '200px', padding: '16px',
                border: '2px solid #fdd537', borderRadius: '16px',
                backgroundColor: '#fffbfa', fontSize: '0.95rem',
                lineHeight: '1.6', resize: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
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
                <div key={item.id} className="lc-item" style={{ display: 'block', padding: '16px', cursor: 'pointer' }} onClick={() => setSelectedReport(item)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#2a1f0e', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '70%' }}>{item.title}</span>
                    {renderStatusBadge(item.status)}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#5a4a32', margin: '0 0 10px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

      {/* ✅ 신고 상세 모달 - 개선 버전 */}
      {selectedReport && (
        <div
          onClick={() => setSelectedReport(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '20px',       // ✅ 좌우 여백 확보
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '400px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              boxSizing: 'border-box', // ✅ padding 포함한 너비 계산
            }}
          >
            {/* 모달 헤더 */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1.5px dashed #eee',
              paddingBottom: '16px', marginBottom: '16px',
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#2a1f0e' }}>신고 상세 내역</h3>
              <button
                onClick={() => setSelectedReport(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#888' }}
              >
                ✕
              </button>
            </div>

            {/* 날짜 + 상태 뱃지 한 줄 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#8a7a60' }}>
                {new Date(selectedReport.createdAt).toLocaleDateString('ko-KR')} 접수
              </span>
              {renderStatusBadge(selectedReport.status)}
            </div>

            {/* 제목 - ✅ 줄바꿈 허용으로 넘침 방지 */}
            <div style={{
              fontWeight: 700,
              fontSize: '1.05rem',
              color: '#2a1f0e',
              marginBottom: '16px',
              lineHeight: 1.5,
              wordBreak: 'break-all',  // ✅ 긴 텍스트 강제 줄바꿈
              overflowWrap: 'break-word',
              padding: '12px 14px',
              background: '#fafafa',
              borderRadius: '10px',
              border: '1px solid #f0ebe0',
            }}>
              {selectedReport.title}
            </div>

            {/* 구분선 */}
            <div style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: '8px' }}>상세 내용</div>

            {/* 본문 - ✅ 줄바꿈 + 스크롤 처리 */}
            <div style={{
              backgroundColor: '#fdfcf0',
              border: '1px solid #fce8a1',
              padding: '16px',
              borderRadius: '16px',
              fontSize: '0.95rem',
              color: '#3a2f1e',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',   // ✅ 줄바꿈 유지
              wordBreak: 'break-all',   // ✅ 긴 단어 강제 줄바꿈
              overflowWrap: 'break-word',
              minHeight: '100px',
              maxHeight: '200px',       // ✅ 너무 길면 스크롤
              overflowY: 'auto',
            }}>
              {selectedReport.content}
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setSelectedReport(null)}
              style={{
                width: '100%', padding: '14px',
                background: '#fdd537', color: '#2a1f0e',
                border: 'none', borderRadius: '14px',
                fontWeight: 700, marginTop: '20px',
                cursor: 'pointer', fontSize: '1rem',
                fontFamily: 'var(--font-title)',
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}