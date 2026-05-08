/**
 * marketService.js
 *
 * BASE_URL을 빈 문자열로 두면 Vite 개발 서버의 프록시(vite.config.js)를 통해
 * 백엔드로 요청이 전달됩니다. 절대 URL을 사용하면 프록시를 우회하여 CORS 에러가
 * 발생할 수 있으므로 반드시 상대 경로를 사용해야 합니다.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/* ══════════════════════════════════════════════════════════
   공통 요청 헬퍼
══════════════════════════════════════════════════════════ */
const apiRequest = async (method, url, body = null) => {
  const token = localStorage.getItem('accessToken');

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  const res = await fetch(`${BASE_URL}${url}`, options);

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!res.ok) {
    if (isJson) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `요청 실패 (${res.status})`);
    }
    throw new Error(
      res.status === 401 ? '로그인이 필요합니다' :
      res.status === 403 ? '접근 권한이 없습니다' :
      res.status === 404 ? 'API 경로를 찾을 수 없습니다' :
      res.status === 500 ? '서버 내부 오류입니다' :
      `요청 실패 (${res.status})`
    );
  }

  if (res.status === 204) return null;
  if (isJson) {
    const json = await res.json();
    return json.data ?? json;
  }
  return null;
};

/* ══════════════════════════════════════════════════════════
   상인 회원가입 (2단계)
══════════════════════════════════════════════════════════ */
export const registerMarket = async (payload) => {

  // 1단계: 유저 계정 생성
  const signupRes = await fetch(`${BASE_URL}/user/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loginId:   payload.userId,
      password: payload.password,
      name:     payload.ceoName,
      phone:    payload.phone,
      role:     'MARKET',
      latitude:  payload.latitude,
      longitude: payload.longitude,
    }),
  });

  let signupJson;
  try {
      signupJson = await signupRes.json();
      console.log("signupJson:", signupJson);

      if(!signupRes.ok){
        throw new Error(signupJson.message || `회원가입 실패 (${signupRes.status})`);
      }
  } catch (e) {
      console.log("json 파싱 오류:", e);
      throw e;
  }
  const accessToken = signupJson.data?.accessToken ?? signupJson.accessToken;
  console.log("accessToken:", accessToken);

  if (accessToken) localStorage.setItem('accessToken', accessToken);


  // 2단계: 시장 등록
  const marketRes = await fetch(`${BASE_URL}/market/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name:           payload.name,
      ceoName:        payload.ceoName,
      businessNumber: payload.businessNumber,
      phone:          payload.phone,
      latitude:       payload.latitude,
      longitude:      payload.longitude,
    }),
  });
  const marketIsJson = marketRes.headers.get('content-type')?.includes('application/json');
  if (!marketRes.ok) {
    const err = marketIsJson ? await marketRes.json().catch(() => ({})) : {};
    throw new Error(err.message || `시장 등록 실패 (${marketRes.status})`);
  }
  const marketJson = await marketRes.json();
  return marketJson.data ?? marketJson;
};

/* ══════════════════════════════════════════════════════════
   내 시장 정보
══════════════════════════════════════════════════════════ */
export const getMyMarket    = ()        => apiRequest('GET', '/market/mypage');
export const updateMyMarket = (payload) => apiRequest('PUT', '/market/mypage', payload);

/* ══════════════════════════════════════════════════════════
   QR 코드
══════════════════════════════════════════════════════════ */
export const getQrCode     = ()  => apiRequest('GET', '/market/qr');
export const reissueQrCode = ()  => apiRequest('PUT', '/market/qr');

/* ══════════════════════════════════════════════════════════
   가까운 시장 (사용자용)
══════════════════════════════════════════════════════════ */
export const getNearbyMarkets = (lat, lng) =>
  apiRequest('GET', `/market?latitude=${lat}&longitude=${lng}`);

/* ══════════════════════════════════════════════════════════
   품목 관리
══════════════════════════════════════════════════════════ */
export const getMarketItems    = ()                => apiRequest('GET',    '/market/items');
export const createMarketItem  = (payload)         => apiRequest('POST',   '/market/items', payload);
export const updateMarketItem  = (itemId, payload) => apiRequest('PUT',    `/market/items/${itemId}`, payload);
export const deleteMarketItem  = (itemId)          => apiRequest('DELETE', `/market/items/${itemId}`);

/* ══════════════════════════════════════════════════════════
   할인 (마감 세일) - SaleScheduler 연동
   saleStatus: "NONE" | "UPCOMING" | "ON_SALE"
══════════════════════════════════════════════════════════ */
export const startSale  = (itemId, payload) => apiRequest('POST',   `/market/items/${itemId}/sale`, payload);
export const cancelSale = (itemId)          => apiRequest('DELETE', `/market/items/${itemId}/sale`);

/* ══════════════════════════════════════════════════════════
   스탬프
   ✅ 백엔드: POST /user/stamp?marketId={marketId}
   → StampController.createStamp() 호출
   → 하루 1회 제한 (ALREADY_STAMPED 에러)
   → UserCoupon 없으면 COUPON_NOT_FOUND 에러
══════════════════════════════════════════════════════════ */
export const createStamp = (marketId) =>
  apiRequest('POST', `/user/stamp?marketId=${marketId}`);

/* ══════════════════════════════════════════════════════════
   쿠폰 (사용자용)
   ✅ 백엔드: GET /user/coupons
   → CouponController.getMyCoupons() 호출
   → UserCouponResponse: { stampCount, requiredStampCount, isCompleted }
══════════════════════════════════════════════════════════ */
export const getMyCoupons = () =>
  apiRequest('GET', '/user/coupons');

/* ══════════════════════════════════════════════════════════
   지역화폐
   ✅ 백엔드:
     GET   /user/local-currency/logs        → 내 사용 내역
     PATCH /user/local-currency/logs/{id}/use → 사용 처리
══════════════════════════════════════════════════════════ */
export const getMyCurrencyLogs = ()      => apiRequest('GET',   '/user/local-currency/logs');
export const useCurrency       = (logId) => apiRequest('PATCH', `/user/local-currency/logs/${logId}/use`);