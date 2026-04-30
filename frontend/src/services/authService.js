/**
 * authService.js
 *
 * 백엔드 DTO 필드명 기준:
 *   로그인:   UserLoginRequest  { loginId, password }
 *   회원가입: UserCreateRequest { loginId, password, name, phone, email, address, role }
 *   응답:     ApiResponse<T>    { success, message, data }
 *   로그인응답: UserLoginResponse { accessToken, refreshToken, user: UserResponse }
 *   UserResponse: { id, loginId, name, phone, email, role, status, ... }
 */

/* ══════════════════════════════════════════════════════════
   로그인
   POST /user/login
   요청: { loginId, password }
   응답: ApiResponse<UserLoginResponse>
         { success, message, data: { accessToken, refreshToken, user } }
══════════════════════════════════════════════════════════ */
export const login = async (form) => {
  const response = await fetch('/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loginId:  form.loginId,   // ✅ 백엔드 UserLoginRequest.loginId
      password: form.password,
    }),
  });

  // 응답이 JSON인지 확인 (500 에러 시 HTML 반환 방지)
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`서버 오류 (${response.status})`);
  }

  // ApiResponse { success, message, data }
  const apiResponse = await response.json();

  if (!response.ok || !apiResponse.success) {
    throw new Error(apiResponse.message || '로그인에 실패했습니다.');
  }

  // apiResponse.data = { accessToken, refreshToken, user }
  return apiResponse.data;
};

/* ══════════════════════════════════════════════════════════
   회원가입
   POST /user/signup
   요청: { loginId, password, name, phone, email, address, role }
   응답: ApiResponse<UserResponse>
══════════════════════════════════════════════════════════ */
export const register = async (form) => {
  const response = await fetch('/user/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loginId:  form.loginId,   // ✅ 백엔드 UserCreateRequest.loginId
      password: form.password,
      name:     form.name,
      phone:    form.phone,
      email:    form.email,
      address:  form.address,
      latitude:  form.latitude  ? parseFloat(form.latitude)  : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      role:     'USER',         // ✅ 일반 회원가입 고정값
    }),
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`서버 오류 (${response.status})`);
  }

  const apiResponse = await response.json();

  if (!response.ok || !apiResponse.success) {
    throw new Error(apiResponse.message || '회원가입에 실패했습니다.');
  }

  return apiResponse.data;
};

/* ══════════════════════════════════════════════════════════
   로그아웃
   POST /user/logout
══════════════════════════════════════════════════════════ */
export const logout = async () => {
  try {
    await fetch('/user/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('로그아웃 API 실패:', err);
  } finally {
    localStorage.clear();
  }
};

/* ══════════════════════════════════════════════════════════
   토큰 재발급
   POST /user/reissue
   Header: Refresh-Token: {refreshToken}
══════════════════════════════════════════════════════════ */
export const reissueToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('로그인이 필요합니다.');

  const response = await fetch('/user/reissue', {
    method: 'POST',
    headers: {
      'Refresh-Token': refreshToken,
      'Content-Type': 'application/json',
    },
  });

  const apiResponse = await response.json();

  if (!response.ok || !apiResponse.success) {
    localStorage.clear();
    throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  const { accessToken, refreshToken: newRefresh } = apiResponse.data;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', newRefresh);

  return apiResponse.data;
};