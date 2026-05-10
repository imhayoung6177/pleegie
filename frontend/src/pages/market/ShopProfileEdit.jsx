/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║              ShopProfileEdit.jsx                         ║
 * ║  상인 프로필 수정 페이지                                  ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║  ✅ 수정 내용 (DB에 저장 안 되던 문제 해결)               ║
 * ║                                                          ║
 * ║  1. updateMyMarket import 추가                           ║
 * ║  2. handleSave를 async 함수로 변환                       ║
 * ║  3. handleSave 내부에서 updateMyMarket() API 직접 호출   ║
 * ║  4. 백엔드 필드명 일치: shopName→name, ownerName→ceoName ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * [데이터 흐름 전체]
 *  주소 검색 버튼 클릭
 *    → 다음 우편번호 팝업
 *    → 주소 선택
 *    → /kakao-api/v2/local/search/address.json (좌표변환)
 *    → form.latitude, form.longitude 저장
 *
 *  수정완료 버튼 클릭
 *    → validate() 유효성 검사
 *    → updateMyMarket({ name, ceoName, phone, latitude, longitude })
 *    → PUT /market/mypage (Spring Boot)
 *    → MarketController.updateMarket()
 *    → MarketService.updateMarket()
 *    → market.updateInfo() → JPA가 DB에 자동 저장 (@Transactional)
 *    → onSave() → 부모 컴포넌트 화면 상태 갱신
 *    → onBack() → 마이페이지로 이동
 */

import React, { useState, useEffect } from 'react';
import '../../Styles/auth/AuthPage.css';
import '../../Styles/auth/RegisterPage.css';
import '../../Styles/market/MarketMyPage.css';

// ✅ [수정 1] updateMyMarket import 추가
// → marketService.js: export const updateMyMarket = (payload) => apiRequest('PUT', '/market/mypage', payload);
import { updateMyMarket } from '../../services/marketService';

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

// 전화번호 자동 하이픈 포맷 (예: 01012345678 → 010-1234-5678)
const formatPhone = (raw) => {
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

// ════════════════════════════════════════════════════════════
// 컴포넌트
// ════════════════════════════════════════════════════════════
const ShopProfileEdit = ({ shopInfo, onBack, onSave }) => {

  // ── form 상태 ────────────────────────────────────────────
  // shopInfo: MarketMyPage에서 전달받은 현재 상점 정보
  const [form, setForm] = useState({
    shopId:    shopInfo?.shopId    || '',   // 아이디 (읽기 전용)
    bizNumber: shopInfo?.bizNumber || '',   // 사업자등록번호 (읽기 전용)
    shopName:  shopInfo?.shopName  || '',   // 상호명
    ownerName: shopInfo?.ownerName || '',   // 대표자명
    phone:     shopInfo?.phone     || '',   // 전화번호
    address:   shopInfo?.address   || '',   // 주소 텍스트 (화면 표시용)
    latitude:  shopInfo?.latitude  || '',   // 위도 (카카오 API로 자동 입력)
    longitude: shopInfo?.longitude || '',   // 경도 (카카오 API로 자동 입력)
    password:  '',                          // 새 비밀번호 (선택)
    confirmPw: '',                          // 비밀번호 확인
  });

  const [showPw,       setShowPw]       = useState(false);  // 비밀번호 표시 토글
  const [showPwC,      setShowPwC]      = useState(false);  // 비밀번호 확인 표시 토글
  const [errors,       setErrors]       = useState({});     // 유효성 검사 에러 메시지
  const [saved,        setSaved]        = useState(false);  // 저장 완료 표시
  const [isLoading,    setIsLoading]    = useState(false);  // API 호출 중 로딩
  const [showPostcode, setShowPostcode] = useState(false);  // 다음 우편번호 팝업

  // ── 위도/경도 → 주소 텍스트 변환 ───────────────────────
  // 목적: 이미 DB에 위도/경도만 있을 때 사용자에게 주소 텍스트로 보여주기
  const convertCoordsToAddress = async (latitude, longitude) => {
    try {
      const res = await fetch(
        // /kakao-api → vite.config.js 프록시 → https://dapi.kakao.com
        `/kakao-api/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
        {
          headers: {
            Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`
          }
        }
      );
      const data = await res.json();
      if (data.documents && data.documents.length > 0) {
        // 도로명 주소 우선, 없으면 지번 주소
        const roadAddr  = data.documents[0].road_address?.address_name;
        const jibunAddr = data.documents[0].address?.address_name;
        return roadAddr || jibunAddr || '';
      }
      return '';
    } catch (err) {
      console.error('[좌표→주소 변환 실패]', err);
      return '';
    }
  };

  // 마운트 시: DB에 위도/경도는 있는데 주소 텍스트가 없는 경우 자동 변환
  useEffect(() => {
    const fetchAddress = async () => {
      if (shopInfo?.latitude && shopInfo?.longitude && !form.address) {
        const addr = await convertCoordsToAddress(shopInfo.latitude, shopInfo.longitude);
        if (addr) setForm(prev => ({ ...prev, address: addr }));
      }
    };
    fetchAddress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopInfo?.latitude, shopInfo?.longitude]);

  // ── 주소 검색 (다음 우편번호 → 카카오 좌표변환) ─────────
  // 흐름: 버튼 클릭 → 팝업 열기 → 주소 선택 → 카카오 API → 위도/경도 저장
  const handleAddressSearch = () => {
    setShowPostcode(true);  // 팝업 컨테이너 표시
    setTimeout(() => {
      new window.daum.Postcode({
        oncomplete: async (data) => {
          const address = data.roadAddress || data.jibunAddress;
          try {
            // 카카오 주소검색 API: 주소 텍스트 → 위도/경도
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
              // ⚠️ 카카오 API 응답: x = 경도(longitude), y = 위도(latitude)  → 헷갈리지 않게 주의!
              setForm(prev => ({
                ...prev,
                address,
                latitude:  geoData.documents[0].y,  // y → 위도(latitude)
                longitude: geoData.documents[0].x,  // x → 경도(longitude)
              }));
            } else {
              setForm(prev => ({ ...prev, address }));
            }
          } catch (err) {
            console.error('[주소→좌표 변환 실패]', err);
            setForm(prev => ({ ...prev, address }));
          }
          setShowPostcode(false); // 팝업 닫기
        },
        width:  '100%',
        height: '100%',
      }).embed(document.getElementById('daum-postcode-container'));
    }, 100); // setTimeout: DOM이 렌더링된 후 embed 실행
  };

  // ── 일반 입력값 변경 핸들러 ──────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ── 전화번호 변경 핸들러 (자동 하이픈 적용) ─────────────
  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setForm(prev => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  // ── 유효성 검사 ──────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.shopName.trim())  e.shopName  = '상호명을 입력해주세요';
    if (!form.ownerName.trim()) e.ownerName = '대표자명을 입력해주세요';
    const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
    if (!form.phone)                       e.phone = '전화번호를 입력해주세요';
    else if (!phoneRegex.test(form.phone)) e.phone = '올바른 형식이 아닙니다 (010-0000-0000)';
    if (!form.address.trim())              e.address = '사업장 주소를 입력해주세요';
    if (form.password) {
      if (form.password.length < 8)              e.password  = '비밀번호는 8자 이상이어야 합니다';
      else if (form.password !== form.confirmPw) e.confirmPw = '비밀번호가 일치하지 않습니다';
    }
    return e;
  };

  // ✅ [수정 2, 3, 4] handleSave - async로 변경 + API 직접 호출
  const handleSave = async (e) => {
    // form submit 기본 동작(새로고침) 방지
    e.preventDefault();

    // 유효성 검사
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // 위도/경도를 문자열 → 숫자로 변환
    // parseFloat: "37.123456" → 37.123456
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);

    // 숫자 변환 실패 시 (주소 검색 안 한 경우)
    if (isNaN(lat) || isNaN(lng)) {
      alert("주소 검색을 통해 위치를 설정해주세요.");
      return;
    }

    setIsLoading(true); // 버튼 비활성화 + "저장 중..." 표시

    try {
      // ✅ [수정 3] PUT /market/mypage 실제 API 호출
      //
      // [요청 흐름]
      //   updateMyMarket() (marketService.js)
      //     → apiRequest('PUT', '/market/mypage', payload)
      //     → fetch PUT /market/mypage + Authorization 헤더 자동 첨부
      //     → Spring Boot MarketController.updateMarket()
      //     → MarketService.updateMarket()
      //     → market.updateInfo(name, ceoName, phone, lat, lng)
      //     → @Transactional → JPA가 변경 감지 → DB UPDATE 실행 ✅
      //
      // ✅ [수정 4] 백엔드 MarketCreateRequest 필드명에 정확히 맞춤
      //   name    ← shopName  (백엔드가 기대하는 필드명)
      //   ceoName ← ownerName (백엔드가 기대하는 필드명)
      await updateMyMarket({
        name:      form.shopName.trim(),   // ✅ 백엔드: private String name;
        ceoName:   form.ownerName.trim(),  // ✅ 백엔드: private String ceoName;
        phone:     form.phone,             // ✅ 백엔드: private String phone;
        latitude:  lat,                    // ✅ 백엔드: private Double latitude;
        longitude: lng,                    // ✅ 백엔드: private Double longitude;
      });

      // API 성공 후 → 부모(MarketMyPage)의 shopInfo 상태 갱신
      // (화면 새로고침 없이 변경된 값이 마이페이지에 바로 반영)
      onSave?.({
        name:      form.shopName.trim(),
        ceoName:   form.ownerName.trim(),
        phone:     form.phone,
        address:   form.address.trim(),
        latitude:  lat,
        longitude: lng,
      });

      setSaved(true);
      // 1.5초 후 마이페이지로 자동 이동
      setTimeout(() => {
        setSaved(false);
        onBack();
      }, 1500);

    } catch (err) {
      // API 호출 실패 시 에러 메시지 표시
      console.error('[프로필 수정 실패]', err);
      alert(err.message || '수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      // 성공/실패 상관없이 로딩 해제
      setIsLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════
  // 렌더링
  // ════════════════════════════════════════════════════════
  return (
    <div style={{ position: "relative" }}>
      <div style={BG_LAYER} />
      <div
        className="mmp-subpage"
        style={{ position: "relative", zIndex: 1, background: "transparent", minHeight: "100vh" }}
      >
        <div
          className="mmp-white-box"
          style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)' }}
        >

          {/* ── 로고 ── */}
          <div className="mmp-logo" style={{ color: 'black' }}>pleegie</div>

          {/* ── 타이틀 ── */}
          <div style={{ textAlign: 'center', marginBottom: '24px', flexShrink: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: '#2a1f0e', margin: '0 0 6px', fontWeight: 700 }}>
              ✏️ 상인정보 수정
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#8a7a60', margin: 0 }}>변경할 정보를 입력해주세요</p>
          </div>

          <div style={{ width: '100%' }}>
            {/* form onSubmit → handleSave(async) 실행 */}
            <form onSubmit={handleSave}>

              {/* ── 아이디 (읽기 전용) ── */}
              <div className="auth-field">
                <label className="auth-label">아이디 (변경 불가)</label>
                <div className="auth-input-wrap readonly">
                  <input type="text" className="auth-input" value={form.shopId} readOnly />
                </div>
              </div>

              {/* ── 사업자 등록번호 (읽기 전용) ── */}
              <div className="auth-field">
                <label className="auth-label">사업자 등록번호 (변경 불가)</label>
                <div className="auth-input-wrap readonly">
                  <input type="text" className="auth-input" value={form.bizNumber} readOnly />
                </div>
              </div>

              {/* ── 상호명 ── */}
              <div className="auth-field">
                <label className="auth-label">상호명</label>
                <div className="auth-input-wrap editable">
                  <input
                    type="text"
                    name="shopName"
                    className="auth-input"
                    placeholder="가게 이름을 입력하세요"
                    value={form.shopName}
                    onChange={handleChange}
                    maxLength={30}
                  />
                </div>
                {errors.shopName && <p className="auth-field-error">⚠ {errors.shopName}</p>}
              </div>

              {/* ── 대표자명 ── */}
              <div className="auth-field">
                <label className="auth-label">대표자명</label>
                <div className="auth-input-wrap editable">
                  <input
                    type="text"
                    name="ownerName"
                    className="auth-input"
                    placeholder="대표자 이름을 입력하세요"
                    value={form.ownerName}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
                {errors.ownerName && <p className="auth-field-error">⚠ {errors.ownerName}</p>}
              </div>

              {/* ── 새 비밀번호 (선택 입력) ── */}
              <div className="auth-field">
                <label className="auth-label">새 비밀번호 (변경 시만 입력)</label>
                <div className="auth-input-wrap editable">
                  <input
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    className="auth-input"
                    placeholder="새 비밀번호 (8자 이상)"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(p => !p)}>
                    {showPw ? '숨기기' : '보이기'}
                  </button>
                </div>
                {errors.password && <p className="auth-field-error">⚠ {errors.password}</p>}
              </div>

              {/* ── 비밀번호 확인 ── */}
              <div className="auth-field">
                <label className="auth-label">비밀번호 확인</label>
                <div className="auth-input-wrap editable">
                  <input
                    type={showPwC ? 'text' : 'password'}
                    name="confirmPw"
                    className="auth-input"
                    placeholder="비밀번호를 한 번 더 입력하세요"
                    value={form.confirmPw}
                    onChange={handleChange}
                  />
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

              {/* ── 전화번호 ── */}
              <div className="auth-field">
                <label className="auth-label">전화번호</label>
                <div className="auth-input-wrap editable">
                  <input
                    type="text"
                    name="phone"
                    className="auth-input"
                    placeholder="010-0000-0000"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    maxLength={13}
                  />
                </div>
                {errors.phone && <p className="auth-field-error">⚠ {errors.phone}</p>}
              </div>

              {/* ── 사업장 주소 ── */}
              <div className="auth-field">
                <label className="auth-label">
                  사업장 주소
                  <span className="reg-addr-badge">가까운 고객 추천에 사용됩니다</span>
                </label>
                <div className="reg-addr-row">
                  {/* 주소 input: readOnly → 주소 검색 버튼으로만 입력 가능 */}
                  <div className="auth-input-wrap reg-addr-input editable">
                    <input
                      type="text"
                      name="address"
                      className="auth-input"
                      placeholder="주소 검색을 이용해주세요"
                      value={form.address}
                      readOnly
                    />
                  </div>
                  {/* 주소 검색 버튼 → 다음 우편번호 팝업 열기 */}
                  <button type="button" className="reg-addr-btn" onClick={handleAddressSearch}>
                    주소 검색
                  </button>
                </div>
                {errors.address && <p className="auth-field-error">⚠ {errors.address}</p>}

              </div>

              {/* ── 수정 완료 버튼 ── */}
              <button
                type="submit"
                className="auth-submit-btn"
                style={{ marginTop: '8px', width: '100%', background: MG, color: MT }}
                disabled={isLoading}  // API 호출 중 중복 클릭 방지
              >
                {/* 상태에 따라 버튼 텍스트 변경 */}
                {isLoading ? '저장 중...' : saved ? '✅ 저장 완료!' : '수정 완료'}
              </button>

            </form>
          </div>

          {/* ── 뒤로 가기 ── */}
          <div style={{ marginTop: 'auto', flexShrink: 0 }}>
            <div className="mmp-back-divider" style={{ margin: '20px 0 16px' }}>
              <span>변경사항이 없으신가요?</span>
            </div>
            <button
              className="mmp-back-link-btn"
              style={{ color: MG, borderColor: MG, background: 'rgba(183,204,172,0.06)' }}
              onClick={onBack}
            >
              마이페이지로 돌아가기
            </button>
          </div>

        </div>

        {/* ── 다음 우편번호 팝업 모달 ── */}
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
              {/* 팝업 닫기 버튼 */}
              <button
                onClick={() => setShowPostcode(false)}
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  zIndex: 1, background: 'none', border: 'none',
                  fontSize: '1.2rem', cursor: 'pointer', color: 'black'
                }}
              >✕</button>
              {/* handleAddressSearch의 .embed()가 이 div 안에 팝업을 그림 */}
              <div id="daum-postcode-container" style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ShopProfileEdit;