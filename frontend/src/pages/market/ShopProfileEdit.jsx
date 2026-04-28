import React, { useState } from 'react';
import '../../Styles/auth/AuthPage.css';
import '../../Styles/auth/RegisterPage.css';
import '../../Styles/market/MarketMyPage.css';

import pleegemarket from "../../assets/pleegemarket.png";

const MG  = "#B7CCAC";
const MGD = "#8fa882";
const MT  = "#2a1f0e";

const BG_LAYER = {
  position: "fixed",
  top: 0, left: 0,
  width: "100%", height: "100%",
  backgroundImage: `url(${pleegemarket})`,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  zIndex: 0,
};

const formatPhone = (raw) => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

const ShopProfileEdit = ({ shopInfo, onBack, onSave }) => {
  const [form, setForm] = useState({
    shopId:    shopInfo?.shopId    || '',
    bizNumber: shopInfo?.bizNumber || '',
    shopName:  shopInfo?.shopName  || '',
    ownerName: shopInfo?.ownerName || '',
    phone:     shopInfo?.phone     || '',
    address:   shopInfo?.address   || '',
    password:  '',
    confirmPw: '',
  });

  const [showPw,  setShowPw]  = useState(false);
  const [showPwC, setShowPwC] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [saved,   setSaved]   = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setForm(prev => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.shopName.trim())  e.shopName  = '상호명을 입력해주세요';
    if (!form.ownerName.trim()) e.ownerName = '대표자명을 입력해주세요';
    const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
    if (!form.phone)                       e.phone = '전화번호를 입력해주세요';
    else if (!phoneRegex.test(form.phone)) e.phone = '올바른 형식이 아닙니다 (010-0000-0000)';
    if (!form.address.trim()) e.address = '사업장 주소를 입력해주세요';
    if (form.password) {
      if (form.password.length < 8)          e.password  = '비밀번호는 8자 이상이어야 합니다';
      else if (form.password !== form.confirmPw) e.confirmPw = '비밀번호가 일치하지 않습니다';
    }
    return e;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({
      shopName: form.shopName.trim(), ownerName: form.ownerName.trim(),
      phone: form.phone, address: form.address.trim(),
      ...(form.password ? { password: form.password } : {}),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={BG_LAYER} />
      <div className="mmp-subpage" style={{ position: "relative", zIndex: 1, background: "transparent", minHeight: "100vh" }}>
      <div className="mmp-white-box" style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)' }}>

        {/* 로고 */}
        <div className="mmp-logo" style={{ color: 'black' }}>pleegie</div>

        <div style={{ textAlign: 'center', marginBottom: '24px', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: '#2a1f0e', margin: '0 0 6px', fontWeight: 700 }}>
            ✏️ 상인정보 수정
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#8a7a60', margin: 0 }}>변경할 정보를 입력해주세요</p>
        </div>

        <div style={{ width: '100%' }}>
          <form onSubmit={handleSave}>

            {/* 아이디 (읽기 전용) */}
            <div className="auth-field">
              <label className="auth-label">아이디 (변경 불가)</label>
              <div className="auth-input-wrap readonly">
                <input type="text" className="auth-input" value={form.shopId} readOnly />
              </div>
            </div>

            {/* 사업자 등록번호 (읽기 전용) */}
            <div className="auth-field">
              <label className="auth-label">사업자 등록번호 (변경 불가)</label>
              <div className="auth-input-wrap readonly">
                <input type="text" className="auth-input" value={form.bizNumber} readOnly />
              </div>
            </div>

            {/* 상호명 */}
            <div className="auth-field">
              <label className="auth-label">상호명</label>
              <div className="auth-input-wrap editable">
                <input type="text" name="shopName" className="auth-input" placeholder="가게 이름을 입력하세요" value={form.shopName} onChange={handleChange} maxLength={30} />
              </div>
              {errors.shopName && <p className="auth-field-error">⚠ {errors.shopName}</p>}
            </div>

            {/* 대표자명 */}
            <div className="auth-field">
              <label className="auth-label">대표자명</label>
              <div className="auth-input-wrap editable">
                <input type="text" name="ownerName" className="auth-input" placeholder="대표자 이름을 입력하세요" value={form.ownerName} onChange={handleChange} maxLength={10} />
              </div>
              {errors.ownerName && <p className="auth-field-error">⚠ {errors.ownerName}</p>}
            </div>

            {/* 새 비밀번호 */}
            <div className="auth-field">
              <label className="auth-label">새 비밀번호 (변경 시만 입력)</label>
              <div className="auth-input-wrap editable">
                <input type={showPw ? 'text' : 'password'} name="password" className="auth-input" placeholder="새 비밀번호 (8자 이상)" value={form.password} onChange={handleChange} />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(p => !p)}>
                  {showPw ? '숨기기' : '보이기'}
                </button>
              </div>
              {errors.password && <p className="auth-field-error">⚠ {errors.password}</p>}
            </div>

            {/* 비밀번호 확인 */}
            <div className="auth-field">
              <label className="auth-label">비밀번호 확인</label>
              <div className="auth-input-wrap editable">
                <input type={showPwC ? 'text' : 'password'} name="confirmPw" className="auth-input" placeholder="비밀번호를 한 번 더 입력하세요" value={form.confirmPw} onChange={handleChange} />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPwC(p => !p)}>
                  {showPwC ? '숨기기' : '보이기'}
                </button>
              </div>
              {form.password && form.confirmPw && (
                <p className={form.password === form.confirmPw ? 'auth-field-ok' : 'auth-field-error'}>
                  {form.password === form.confirmPw ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
                </p>
              )}
            </div>

            {/* 전화번호 */}
            <div className="auth-field">
              <label className="auth-label">전화번호</label>
              <div className="auth-input-wrap editable">
                <input type="text" name="phone" className="auth-input" placeholder="010-0000-0000" value={form.phone} onChange={handlePhoneChange} maxLength={13} />
              </div>
              {errors.phone && <p className="auth-field-error">⚠ {errors.phone}</p>}
            </div>

            {/* 사업장 주소 */}
            <div className="auth-field">
              <label className="auth-label">사업장 주소 <span className="reg-addr-badge">가까운 고객 추천에 사용됩니다</span></label>
              <div className="auth-input-wrap editable">
                <input type="text" name="address" className="auth-input" placeholder="예) 서울시 마포구 홍익로 12" value={form.address} onChange={handleChange} />
              </div>
              {errors.address && <p className="auth-field-error">⚠ {errors.address}</p>}
            </div>

            {/* ✅ 수정 완료 버튼 → 그린 */}
            <button
              type="submit"
              className="auth-submit-btn"
              style={{ marginTop: '8px', width: '100%', background: MG, color: MT, boxShadow: `0 3px 0 ${MGD}` }}
            >
              {saved ? '✅ 저장 완료!' : '수정 완료'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 'auto', flexShrink: 0 }}>
          <div className="mmp-back-divider" style={{ margin: '20px 0 16px' }}>
            <span>변경사항이 없으신가요?</span>
          </div>
          {/* ✅ 마이페이지로 돌아가기 → 그린 */}
          <button
            className="mmp-back-link-btn"
            style={{ color: MG, borderColor: MG, background: 'rgba(183,204,172,0.06)' }}
            onClick={onBack}
          >
            마이페이지로 돌아가기
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ShopProfileEdit;