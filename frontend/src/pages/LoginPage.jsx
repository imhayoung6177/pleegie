import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/AuthPage.css";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;

/* ──────────────────────────────────────────
   LoginPage — [일반 회원 / 소상공인] 공용 로그인 페이지
   ✅ props로 전달받은 role ("USER" 또는 "SHOP")에 따라 UI가 변경됩니다.
────────────────────────────────────────── */
const LoginPage = ({ role }) => {
  // 🚀 props로 role을 받습니다.
  const navigate = useNavigate();

  // role에 따른 한글 명칭 설정 (English: Mapping roles to labels)
  const roleName = role === "SHOP" ? "소상공인" : "일반 회원";

  const [form, setForm] = useState({ userId: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.userId.trim()) newErrors.userId = "아이디를 입력해주세요";
    if (!form.password) newErrors.password = "비밀번호를 입력해주세요";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      // 🚀 role 정보도 같이 서버에 보내주면 더 좋습니다.
      const response = await axios.post("/api/auth/login", {
        name: form.userId,
        password: form.password, // 패스워드도 필요하겠죠?
        role: role, // 서버에 '누가' 로그인하는지 알려줍니다.
      });

      if (response.data.success) {
        localStorage.setItem("userName", response.data.userName);
        localStorage.setItem("userId", String(response.data.userId));
        localStorage.setItem("userRole", role); // ✅ 역할도 저장해두면 편리해요!

        alert(`${response.data.userName}님 환영합니다!`);

        // 🚀 역할에 따라 이동할 '방'을 정해줍니다.
        if (role === "SHOP") {
          navigate("/shop/dashboard"); // 소상공인 메인으로
        } else {
          navigate("/user"); // 일반 회원 메인으로
        }
      }
    } catch (err) {
      console.error("로그인 오류:", err);
      const errorMsg = err.response?.data?.message || "로그인에 실패했습니다.";
      setErrors({ general: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`auth-bg ${role === "SHOP" ? "shop-theme" : ""}`}>
      <div className="auth-card anim-pop">
        <div className="auth-logo" onClick={() => navigate("/")}>
          <span className="auth-logo-text">Pleege</span>
        </div>

        <div className="auth-header">
          {/* 🚀 여기가 핵심! roleName에 따라 제목이 바뀝니다. */}
          <h2 className="auth-title">{roleName} 로그인</h2>
          <p className="auth-sub">아이디와 비밀번호를 입력해주세요</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* 아이디/비밀번호 입력 필드는 기존과 동일 */}
          <div className="auth-field">
            <label className="auth-label">아이디</label>
            <input type="text" name="userId" className="auth-input" value={form.userId} onChange={handleChange} />
          </div>
          <div className="auth-field">
            <label className="auth-label">비밀번호</label>
            <input
              type={showPw ? "text" : "password"}
              name="password"
              className="auth-input"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="auth-divider">
          <span>계정이 없으신가요?</span>
        </div>
        {/* 회원가입 주소도 역할에 따라 맞춰줍니다. */}
        <Link to={role === "SHOP" ? "/shop/register" : "/register"} className="auth-link-btn">
          {roleName} 회원가입 하기
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
