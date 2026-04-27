import axios from "axios";

// 1. axios 인스턴스 생성 (설정 공통화)
const apiClient = axios.create({
  baseURL: "", // vite-proxy를 사용하므로 비워둡니다.
  withCredentials: true,
});

// 2. 인터셉터: 모든 요청에 토큰 자동 탑승
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    // Bearer 뒤에 한 칸 공백 필수!
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// 3. 로그인 API (백엔드 UserLoginRequest DTO 이름에 맞춤)
export const login = async ({ userId, password }) => {
  const response = await apiClient.post("/user/login", {
    loginId: userId, // 백엔드가 'loginId'를 받기로 했다면 이렇게 매핑
    password: password,
  });
  
  // 백엔드 성공 시: { status: 200, data: { accessToken: "...", ... } } 구조라고 가정
  // const result = response.data;
  // if (result.data && result.data.accessToken) {
  //   localStorage.setItem('accessToken', result.data.accessToken);
  //   localStorage.setItem('userName', result.data.name);
  // }

  // ↑ 현재 중복저장 문제 해결. result.data.name은 없고 data.user.name은 있음
  // if문에서 한번 저장한걸 LoginPage.jsx에서 또 저장하고 있었음.
  // 여기서는 저장하지 않고 반환만, LoginPage에서 저장하도록 위임
  return response.data.data;
};

// 4. 회원가입 API
export const register = async (userData) => {
  const response = await apiClient.post("/user/signup", {
    loginId: userData.userId,
    password: userData.password,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    role: "USER" // 기본 권한 설정
  });
  return response.data;
};