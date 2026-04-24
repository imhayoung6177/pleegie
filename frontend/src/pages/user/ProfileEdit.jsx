import React, { useState } from 'react';
import '../../Styles/auth/AuthPage.css';
import '../../Styles/auth/RegisterPage.css';
import '../../Styles/user/MyPage.css'; // 새로 추가한 CSS 적용

const ProfileEdit = ({ userInfo, onBack }) => {
  const [form, setForm] = useState({
    userId:   userInfo?.userId   || 'leejongbin',
    name:     userInfo?.name     || '이종빈',
    password: '',
    phone:    userInfo?.phone    || '010-1234-5678',
    email:    userInfo?.email    || 'leejb@example.com',
    address:  userInfo?.address  || '서울시 구로구 디지털로 300',
  });
  const [showPw, setShowPw] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // ✅ 나중에 API 연동: await updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mypage-subpage">
      <div className="mypage-white-box">
        {/* 로고 */}
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-title)',
          fontSize: '1.8rem',
          color: '#FF6B35',
          fontWeight: 700,
          marginBottom: '8px',
        }}>
          pleegie
        </div>

        {/* 타이틀 */}
        <div style={{ textAlign: 'center', marginBottom: '28px', flexShrink: 0 }}>
          <h2 style={{
            fontFamily: 'var(--font-title)',
            fontSize: '1.5rem',
            color: '#2a1f0e',
            margin: '0 0 6px',
            fontWeight: 700,
          }}>
            회원정보 수정
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#8a7a60', margin: 0 }}>
            변경할 정보를 입력해주세요
          </p>
        </div>

        <div style={{ width: '100%' }}>
          <form onSubmit={handleSave}>

            {/* 아이디 (읽기 전용) */}
            <div className="auth-field">
              <label className="auth-label">아이디 (변경 불가)</label>
              <div className="auth-input-wrap readonly">
                <input type="text" className="auth-input" value={form.userId} readOnly />
              </div>
            </div>

            {/* 이름 */}
            <div className="auth-field">
              <label className="auth-label">이름</label>
              <div className="auth-input-wrap editable">
                <input
                  type="text" name="name" className="auth-input"
                  placeholder="실명을 입력하세요"
                  value={form.name} onChange={handleChange} maxLength={10}
                />
              </div>
            </div>

            {/* 새 비밀번호 */}
            <div className="auth-field">
              <label className="auth-label">새 비밀번호 (변경 시만 입력)</label>
              <div className="auth-input-wrap editable">
                <input
                  type={showPw ? 'text' : 'password'} name="password" className="auth-input"
                  placeholder="새 비밀번호 (8자 이상)"
                  value={form.password} onChange={handleChange}
                />
                <button type="button" className="auth-pw-toggle"
                  onClick={() => setShowPw(p => !p)}>
                  {showPw ? '숨기기' : '보이기'}
                </button>
              </div>
            </div>

            {/* 전화번호 */}
            <div className="auth-field">
              <label className="auth-label">전화번호</label>
              <div className="auth-input-wrap editable">
                <input
                  type="text" name="phone" className="auth-input"
                  placeholder="010-0000-0000"
                  value={form.phone} onChange={handleChange} maxLength={13}
                />
              </div>
            </div>

            {/* 이메일 */}
            <div className="auth-field">
              <label className="auth-label">이메일</label>
              <div className="auth-input-wrap editable">
                <input
                  type="email" name="email" className="auth-input"
                  placeholder="example@email.com"
                  value={form.email} onChange={handleChange}
                />
              </div>
            </div>

            {/* 집 주소 */}
            <div className="auth-field">
              <label className="auth-label">
                집 주소
                <span className="reg-addr-badge">가까운 시장 추천에 사용됩니다</span>
              </label>
              <div className="auth-input-wrap editable">
                <input
                  type="text" name="address" className="auth-input"
                  placeholder="예) 서울시 강남구 테헤란로 123"
                  value={form.address} onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" style={{ marginTop: '8px', width: '100%' }}>
              {saved ? '✅ 저장 완료!' : '수정 완료'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 'auto', flexShrink: 0 }}>
          <div className="auth-divider" style={{ margin: '20px 0 16px' }}>
            <span>변경사항이 없으신가요?</span>
          </div>
          <button className="auth-link-btn" onClick={onBack}>
            마이페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;