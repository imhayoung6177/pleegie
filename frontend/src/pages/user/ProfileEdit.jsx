import React, { useState } from 'react';

const ProfileEdit = () => {
  const [form, setForm] = useState({
    userId: "leejongbin", // 수정 불가 (회색)
    name: localStorage.getItem('userName') || "이종빈", // 수정 가능 (흰색)
    phone: "010-1234-5678",
    address: "서울시 구로구 디지털로",
  });

  return (
    <div className="mp-detail-content anim-pop">
      <div className="auth-card" style={{ maxWidth: '100%', boxShadow: 'none', background: 'transparent' }}>
        <h2 className="mp-section-title">✏️ 회원 정보 수정</h2>
        <form className="auth-form">
          <div className="auth-field">
            <label className="auth-label">아이디 (변경 불가)</label>
            <div className="auth-input-wrap" style={{ backgroundColor: '#e9ecef' }}> {/* 수정불가: 회색 */}
              <input type="text" className="auth-input" value={form.userId} readOnly style={{ color: '#adb5bd' }} />
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label">이름</label>
            <div className="auth-input-wrap" style={{ backgroundColor: '#ffffff', border: '2px solid #3a90c8' }}> {/* 수정가능: 흰색 */}
              <input type="text" className="auth-input" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label">전화번호</label>
            <div className="auth-input-wrap" style={{ backgroundColor: '#ffffff', border: '2px solid #3a90c8' }}>
              <input type="text" className="auth-input" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} />
            </div>
          </div>
          <button type="button" className="auth-submit-btn" onClick={() => alert('정보가 수정되었습니다.')}>수정 완료</button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;