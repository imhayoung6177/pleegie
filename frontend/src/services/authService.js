import axios from "axios";

// ────────────────────────────────────────────────────────
// 백엔드(Spring Boot) 연동 완료 후 아래 값을 false 로 변경
// ────────────────────────────────────────────────────────
const USE_MOCK = true;

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;

// ── Mock 유틸 ─────────────────────────────────────────
const MOCK_KEY = "mock_users";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const getMockUsers = () => JSON.parse(localStorage.getItem(MOCK_KEY) || "[]");
const saveMockUsers = (users) => localStorage.setItem(MOCK_KEY, JSON.stringify(users));

// ── Mock 구현 ─────────────────────────────────────────
const mockRegister = async ({ userId, password, name, phone, email, address, addressDetail }) => {
  await delay(600);
  const users = getMockUsers();
  if (users.find((u) => u.userId === userId)) {
    throw new Error("이미 사용 중인 아이디입니다.");
  }
  const newUser = {
    id: Date.now(),
    userId,
    password,
    name,
    phone,
    email,
    address,
    addressDetail,
    role: "USER",
  };
  saveMockUsers([...users, newUser]);
  return { success: true };
};

const mockLogin = async ({ userId, password, role }) => {
  await delay(600);
  const users = getMockUsers();
  const user = users.find((u) => u.userId === userId && u.password === password);
  if (!user) throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
  return { success: true, userName: user.name, userId: user.id };
};

// ── 실제 API 구현 (백엔드 연동 시 사용) ───────────────
const apiLogin = async ({ userId, password, role }) => {
  const response = await axios.post("/api/auth/login", {
    name: userId,
    password,
    role,
  });
  return response.data;
};

const apiRegister = async (data) => {
  const response = await axios.post("/api/auth/register", data);
  return response.data;
};

// ── 외부에 노출되는 함수 ──────────────────────────────
export const login = USE_MOCK ? mockLogin : apiLogin;
export const register = USE_MOCK ? mockRegister : apiRegister;
