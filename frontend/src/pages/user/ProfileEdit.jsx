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
    address: '',    // 화면 표시용 (DB 저장 안 함)
    latitude: '',
    longitude: '',
  });

  const [loading, setLoading]           = useState(true);
  const [showPw, setShowPw]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [showPostcode, setShowPostcode] = useState(false);

  // ── JWT 토큰 헤더 ─────────────────────────────────────
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  // ── 위도/경도 → 주소 텍스트 변환 (카카오 프록시 사용) ──
  // vite.config.js에서 /kakao-api → https://dapi.kakao.com 으로 프록시됨
  const convertCoordsToAddress = async (latitude, longitude) => {
    try {
      const res = await fetch(
        `/kakao-api/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
        {
          headers: {
            Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`
          }
        }
      );
      const data = await res.json();
      if (data.documents && data.documents.length > 0) {
        const roadAddr  = data.documents[0].road_address?.address_name;
        const jibunAddr = data.documents[0].address?.address_name;
        return roadAddr || jibunAddr || '';
      }
      return '';
    } catch (err) {
      console.error('주소 변환 실패:', err);
      return '';
    }
  };

  // ── 유저 정보 불러오기 ────────────────────────────────
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/user/mypage', { headers: getAuthHeaders() });
        const result   = await response.json();

        if (response.ok) {
          const user = result.data;

          // 위도/경도가 있으면 주소 텍스트로 변환해서 input에 표시
          let address = '';
          if (user.latitude && user.longitude) {
            address = await convertCoordsToAddress(user.latitude, user.longitude);
          }

          setForm({
            loginId:         user.loginId  || '',
            name:            user.name     || '',
            password:        '',
            currentPassword: '',
            phone:           user.phone    || '',
            email:           user.email    || '',
            address,                          // 변환된 주소 텍스트
            latitude:        user.latitude  || '',
            longitude:       user.longitude || '',
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

  // ── 입력값 변경 ───────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ── 주소 검색 (다음 우편번호 → 카카오 좌표 변환) ──────
  const handleAddressSearch = () => {
  setShowPostcode(true);
  setTimeout(() => {
    new window.daum.Postcode({
      oncomplete: async (data) => {
        const address = data.roadAddress || data.jibunAddress;
        try {
          const res = await fetch(
            `/kakao-api/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
            {
              headers: {
                Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`
              }
            }
          );
          const geoData = await res.json();
          if (geoData.documents?.length > 0) {
            setForm(prev => ({
              ...prev,
              address,
              latitude:  geoData.documents[0].y,
              longitude: geoData.documents[0].x,
            }));
          } else {
            setForm(prev => ({ ...prev, address }));
          }
        } catch (err) {
          console.error('좌표 변환 실패:', err);
          setForm(prev => ({ ...prev, address }));
        }
        setShowPostcode(false);
      },
      width:  '100%',
      height: '100%',
    }).embed(document.getElementById('daum-postcode-container'));
  }, 100);
};

  // ── 저장 ─────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();

    // 위도/경도 숫자 변환 및 유효성 체크
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert("주소 검색을 통해 위치를 설정해주세요.");
      return;
    }

    try {
      // 1. 기본 정보 수정
      // 백엔드 UserUpdateRequest: name, phone, email, address, latitude, longitude
      const response = await fetch('/user/mypage', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name:      form.name,
          phone:     form.phone,
          email:     form.email,
          address:   form.address, // address 컬럼이 User 엔티티에 있으므로 같이 전송
          latitude:  lat,
          longitude: lng,
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(errData.message || "수정에 실패했습니다.");
        return;
      }

      // 2. 비밀번호 변경 (새 비밀번호 입력한 경우만)
      if (form.password.trim()) {
        const pwResponse = await fetch('/user/password', {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            currentPassword: form.currentPassword,
            newPassword:     form.password,
          })
        });

        if (!pwResponse.ok) {
          alert("비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.");
          return;
        }
      }

      // 3. 저장 완료
      setSaved(true);
      localStorage.setItem('userName', form.name);
      setTimeout(() => { setSaved(false); onBack(); }, 1500);

    } catch (err) {
      console.error("수정 API 호출 에러:", err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  // ── 로딩 중 ───────────────────────────────────────────
  if (loading) return (
    <div className="mypage-subpage" style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
      사용자 정보를 불러오는 중...
    </div>
  );

  return (
    <div className="mypage-subpage">
      <div className="mypage-white-box">

        {/* 로고 */}
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: 'black', fontWeight: 700, marginBottom: '8px' }}>
          pleegie
        </div>

        {/* 타이틀 */}
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

            {/* 아이디 (읽기 전용) */}
            <div className="auth-field">
              <label className="auth-label">아이디 (변경 불가)</label>
              <div className="auth-input-wrap readonly">
                <input type="text" className="auth-input" value={form.loginId} readOnly />
              </div>
            </div>

            {/* 이름 */}
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
                <input type="password" name="currentPassword" placeholder="현재 비밀번호" className="auth-input" value={form.currentPassword} onChange={handleChange} />
              </div>
            </div>

            {/* 새 비밀번호 */}
            <div className="auth-field">
              <label className="auth-label">새 비밀번호 (변경 시만 입력)</label>
              <div className="auth-input-wrap editable">
                <input type={showPw ? 'text' : 'password'} name="password" placeholder="새 비밀번호 (8자 이상)" className="auth-input" value={form.password} onChange={handleChange} />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(p => !p)}>
                  {showPw ? '숨기기' : '보이기'}
                </button>
              </div>
            </div>

            {/* 전화번호 */}
            <div className="auth-field">
              <label className="auth-label">전화번호</label>
              <div className="auth-input-wrap editable">
                <input type="text" name="phone" className="auth-input" value={form.phone} onChange={handleChange} maxLength={13} />
              </div>
            </div>

            {/* 이메일 */}
            <div className="auth-field">
              <label className="auth-label">이메일</label>
              <div className="auth-input-wrap editable">
                <input type="email" name="email" className="auth-input" value={form.email} onChange={handleChange} />
              </div>
            </div>

            {/* 주소 검색 */}
            <div className="auth-field">
              <label className="auth-label">
                집 주소 <span className="reg-addr-badge">가까운 시장 추천에 사용됩니다</span>
              </label>
              <div className="reg-addr-row">
                <div className="auth-input-wrap reg-addr-input editable">
                  <input
                    type="text"
                    name="address"
                    className="auth-input"
                    value={form.address}
                    readOnly
                    placeholder="주소 검색을 이용해주세요"
                  />
                </div>
                <button type="button" className="reg-addr-btn" onClick={handleAddressSearch}>
                  주소 검색
                </button>
              </div>
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="auth-submit-btn" style={{ flex: 1, margin: 0 }} onClick={onBack}>
                뒤로 가기
              </button>
              <button type="submit" className="auth-submit-btn" style={{ flex: 1, margin: 0 }}>
                {saved ? '✅ 저장 완료!' : '수정 완료'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 주소 검색 모달 */}
      {showPostcode && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100%', height: '100%',
          zIndex: 99999,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: '400px', height: '500px',
            backgroundColor: 'white',
            borderRadius: '12px', overflow: 'hidden',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowPostcode(false)}
              style={{
                position: 'absolute', top: '10px', right: '10px',
                zIndex: 1, background: 'none', border: 'none',
                fontSize: '1.2rem', cursor: 'pointer', color: 'black'
              }}
            >✕</button>
            <div id="daum-postcode-container" style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileEdit;