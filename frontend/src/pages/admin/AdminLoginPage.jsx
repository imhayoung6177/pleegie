import React from "react";
import { useNavigate } from "react-router-dom";

const AdminLoginPage = () => {
  const navigate = useNavigate();

  const handleTempLogin = () => {
    // 1. 아이디/비번 검사 없이 바로 대시보드로 이동! - 황준호
    {
      /* 추후에 동료분이 로그인 폼(input, button)을 만드실 거예요! */
    }
    navigate("/admin/dashboard");
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>🔐 관리자 로그인 (임시)</h1>
      <p>개발 중에는 아래 버튼을 누르면 바로 대시보드로 이동합니다.</p>

      <div style={{ margin: "20px" }}>
        <input type="text" placeholder="Admin ID" disabled />
        <br />
        <input type="password" placeholder="Password" disabled />
      </div>

      <button
        onClick={handleTempLogin}
        style={{ padding: "10px 20px", backgroundColor: "red", color: "white", border: "none", cursor: "pointer" }}
      >
        임시 로그인 (대시보드로 바로가기)
      </button>
    </div>
  );
};

export default AdminLoginPage;
