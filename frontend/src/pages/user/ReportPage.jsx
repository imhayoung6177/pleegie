import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/auth/AuthPage.css';

export default function ReportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/user/report', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: form.title,
          content: form.content,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        alert('불편사항이 접수되었습니다. 감사합니다!');
        navigate('/user/mypage');
      } else {
        alert(json.message || '접수에 실패했습니다.');
      }
    } catch (err) {
      console.error('접수 실패:', err);
      alert('오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mypage-subpage">
      <div className="mypage-white-box">
        <div style={{ color: 'black', fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '10px' }}>pleegie</div>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📢 불편사항 접수</h2>

        <form onSubmit={handleSubmit}>
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
              placeholder="불편하셨던 점을 구체적으로 적어주시면 큰 도움이 됩니다."
              value={form.content}
              onChange={e => setForm({...form, content: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="auth-submit-btn"
              style={{ flex: 1, margin: 0 }}
              onClick={() => navigate('/user/mypage')}>돌아가기</button>
            <button type="submit" className="auth-submit-btn"
              style={{ flex: 1, margin: 0 }}
              disabled={isLoading}>
              {isLoading ? '접수 중...' : '접수하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}