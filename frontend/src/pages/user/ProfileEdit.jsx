import React, { useState, useEffect } from 'react';
import '../../Styles/auth/AuthPage.css';
import '../../Styles/auth/RegisterPage.css';
import '../../Styles/user/MyPage.css';

const ProfileEdit = ({ onBack }) => {
  const [form, setForm] = useState({
    loginId: '', 
    name: '',
    password: '',
    currentPassword: '',
    phone: '',
    email: '',
    address: '',
  });

  const [loading, setLoading] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [saved, setSaved] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // ✅ [수정] 백엔드 컨트롤러의 @GetMapping("/user/mypage")와 일치시킴
        // 앞에 /api 가 붙는지 안붙는지는 백엔드 설정 파일(yml)을 봐야하지만, 
        // 컨트롤러 상에 적힌 그대로 "/user/mypage"를 먼저 시도합니다.
        const response = await fetch('/user/mypage', { headers: getAuthHeaders() });
        const result = await response.json();
        
        if (response.ok) {
          const user = result.data;
          setForm({
            loginId: user.loginId || '',
            name: user.name || '',
            password: '',
            phone: user.phone || '',
            email: user.email || '',
            address: user.address || '',
          });
        }
      } catch (err) {
        console.error("사용자 정보 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let latitude = null;
      let longitude = null;

      // 주소가 입력된 경우 카카오맵 API로 좌표 변환
      if (form.address.trim()) {
        const kakaoKey = import.meta.env.VITE_KAKAO_REST_API_KEY;
        const geoRes = await fetch(
          `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(form.address)}`,
          { headers: { Authorization: `KakaoAK ${kakaoKey}` } }
        );
        const geoData = await geoRes.json();

        if (geoData.documents?.length > 0) {
          latitude = parseFloat(geoData.documents[0].y);
          longitude = parseFloat(geoData.documents[0].x);
        } else {
          alert("주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요.");
          return;
        }
      }

      // ✅ [수정] 백엔드 컨트롤러의 @PutMapping("/user/mypage")와 일치시킴
      const response = await fetch('/user/mypage', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          latitude,
          longitude,
        })
      });

      if (!response.ok) {
        alert("수정에 실패했습니다.");
        return;
      }

      // 2. 비밀번호 변경 (입력한 경우만)
      if (form.password.trim()) {
        const pwResponse = await fetch('/user/password', {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            currentPassword: form.currentPassword,
            newPassword: form.password,
          })
        });

        if (!pwResponse.ok) {
          alert("비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.");
          return;
        }
      }

      setSaved(true);
      localStorage.setItem('userName', form.name);
      setTimeout(() => { setSaved(false); onBack(); }, 1500);
    } catch (err) {
      console.error("수정 API 호출 에러:", err);
    }
  };

  if (loading) return <div className="mypage-subpage" style={{color: 'white', textAlign: 'center', padding: '50px'}}>사용자 정보를 불러오는 중...</div>;

  return (
    <div className="mypage-subpage">
      <div className="mypage-white-box">
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: 'black', fontWeight: 700, marginBottom: '8px' }}>
          pleegie
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: '#2a1f0e', margin: '0 0 6px', fontWeight: 700 }}>
            회원정보 수정
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#8a7a60', margin: 0 }}>
            변경할 정보를 입력해주세요
          </p>
        </div>

        <div style={{ width: '100%' }}>
          <form onSubmit={handleSave}>
            <div className="auth-field">
              <label className="auth-label">아이디 (변경 불가)</label>
              <div className="auth-input-wrap readonly">
                <input type="text" className="auth-input" value={form.loginId} readOnly />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">이름</label>
              <div className="auth-input-wrap editable">
                <input type="text" name="name" className="auth-input" value={form.name} onChange={handleChange} maxLength={10} />
              </div>
            </div>

            {/* 현재 비밀번호 */}
            <div className="auth-field">
              <label className="auth-label">현재 비밀번호 (비밀번호 변경 시 필요)</label>
              <div className="auth-input-wrap editable">
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="현재 비밀번호"
                  className="auth-input"
                  value={form.currentPassword || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">새 비밀번호 (변경 시만 입력)</label>
              <div className="auth-input-wrap editable">
                <input type={showPw ? 'text' : 'password'} name="password" placeholder="새 비밀번호 (8자 이상)" className="auth-input" value={form.password} onChange={handleChange} />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(p => !p)}>
                  {showPw ? '숨기기' : '보이기'}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">전화번호</label>
              <div className="auth-input-wrap editable">
                <input type="text" name="phone" className="auth-input" value={form.phone} onChange={handleChange} maxLength={13} />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">이메일</label>
              <div className="auth-input-wrap editable">
                <input type="email" name="email" className="auth-input" value={form.email} onChange={handleChange} />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">
                집 주소 <span className="reg-addr-badge">가까운 시장 추천에 사용됩니다</span>
              </label>
              <div className="auth-input-wrap editable">
                <input type="text" name="address" className="auth-input" value={form.address} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="auth-submit-btn" style={{ flex: 1, margin: 0 }} onClick={onBack}>뒤로 가기</button>
              <button type="submit" className="auth-submit-btn" style={{ flex: 1, margin: 0 }}>{saved ? '✅ 저장 완료!' : '수정 완료'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;