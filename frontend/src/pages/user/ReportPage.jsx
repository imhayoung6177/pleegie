import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/auth/AuthPage.css';

export default function ReportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ type: '불친절', title: '', content: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // API 연동: fetch('/user/report', { method: 'POST', body: JSON.stringify(form) })
    alert("소중한 의견이 접수되었습니다.");
    navigate('/user/mypage');
  };

  return (
    <div className="mypage-subpage">
      <div className="mypage-white-box">
        <div style={{ color: '#FF6B35', fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '10px' }}>pleegie</div>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📢 신고 및 불편사항 접수</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">신고 유형</label>
            <select className="auth-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: '100%' }}>
              <option>불친절/서비스 불만</option>
              <option>위생 불량</option>
              <option>가격/정량 미달</option>
              <option>기타</option>
            </select>
          </div>

          <div className="auth-field">
            <label className="auth-label">제목</label>
            <input type="text" className="auth-input" placeholder="제목을 입력하세요" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>

          <div className="auth-field">
            <label className="auth-label">상세 내용</label>
            <textarea className="auth-input" style={{ height: '150px', paddingTop: '12px' }} placeholder="내용을 구체적으로 적어주시면 큰 도움이 됩니다." value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
          </div>

          <button type="submit" className="auth-submit-btn">신고하기</button>
        </form>

        <button className="auth-link-btn" onClick={() => navigate('/user/mypage')}>취소하고 돌아가기</button>
      </div>
    </div>
  );
}