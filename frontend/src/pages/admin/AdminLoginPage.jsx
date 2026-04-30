import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminCommon.css";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  // 🚀 이미 로그인된 상태인지 감시 (중복 로그인 방지)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // 주머니에 토큰이 있다면 로그인 창을 보여주지 않고 대시보드로 강제 이동!
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  // AdminLoginPage.jsx 내부 handleLogin 함수 수정

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. 서버에 로그인 요청을 보냅니다.
      const response = await axios.post("/admin/login", {
      loginId,
      password,
    });

      // 🚀 [가장 중요] 백엔드가 ApiResponse 구조를 쓰므로 .data.data 에서 꺼내야 합니다!
      // response.data는 {success, message, data} 상자이고,
      // 그 안의 .data가 실제 {accessToken, refreshToken} 알맹이입니다.
      if (response.data && response.data.data) {
        const { accessToken, refreshToken } = response.data.data;

        // 🔐 금고(LocalStorage)에 정확하게 저장합니다.
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userRole",     "ADMIN");
        localStorage.setItem("userName",     "관리자");

        alert("관리자 로그인 성공!");

        // 🏎️ 대시보드로 즉시 이동합니다.
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("로그인 에러:", error);
      alert("아이디 또는 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1 className="admin-logo">pleegie</h1>
        <h2 className="admin-title">관리자 로그인</h2>
        <form onSubmit={handleLogin}>
          <div className="admin-input-group">
            <label className="admin-label">아이디</label>
            <input
              type="text"
              className="admin-input"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
            />
          </div>
          <div className="admin-input-group">
            <label className="admin-label">비밀번호</label>
            <input
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="admin-btn-main">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
