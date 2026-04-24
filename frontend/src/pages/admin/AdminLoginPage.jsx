import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCommon.css";

const AdminLoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        {/* 1. 로고 */}
        <h1 className="admin-logo">pleegie</h1>

        {/* 2. 타이틀 영역 */}
        <h2 className="admin-title">관리자 로그인</h2>
        <p className="admin-subtitle">시스템 관리자 전용 공간입니다</p>

        {/* 3. 로그인 폼 */}
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="admin-input-group">
            <label className="admin-label">아이디</label>
            <input type="text" className="admin-input" placeholder="Admin ID 입력" />
          </div>

          <div className="admin-input-group">
            <label className="admin-label">비밀번호</label>
            <input type="password" className="admin-input" placeholder="Password 입력" />
          </div>

          <button className="admin-btn-main">로그인</button>
        </form>

        {/* 4. 임시 버튼 (점선 구분) */}
        <div style={{ marginTop: "30px", borderTop: "1px dashed #eee", paddingTop: "20px" }}>
          <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "10px" }}>[개발자 모드] 테스트용 입장</p>
          <button className="admin-btn-temp" onClick={() => navigate("/admin/dashboard")}>
            대시보드 바로가기 (임시)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
