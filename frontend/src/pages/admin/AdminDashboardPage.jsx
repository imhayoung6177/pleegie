import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminCommon.css";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        // 서버 연결 확인 (실제 엔드포인트에 맞춰 조절)
        await axios.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdminName("관리자");
      } catch (error) {
        console.error("인증 실패:", error);
        localStorage.clear();
        navigate("/admin/login", { replace: true });
      }
    };
    fetchData();

    window.history.pushState(null, null, window.location.href);
    const handlePreventBack = () => {
      window.location.href = "/";
    };
    window.addEventListener("popstate", handlePreventBack);
    return () => window.removeEventListener("popstate", handlePreventBack);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    alert("안전하게 로그아웃 되었습니다.");
    navigate("/", { replace: true });
  };

  return (
    <div className="admin-login-container dashboard-mode">
      {/* 🚀 상단 네비게이션 바 */}
      <nav className="admin-topnav">
        <div className="admin-topnav-left">
          {/* 크기가 조절된 로고 */}
          <h1 className="admin-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            pleegie
          </h1>
        </div>
        <div className="admin-topnav-right">
          <span className="admin-user-info">👤 {adminName || "관리자"}님</span>
          {/* 일반 페이지와 똑같아진 로그아웃 버튼 */}
          <button onClick={handleLogout} className="admin-btn-logout">
            로그아웃
          </button>
        </div>
      </nav>

      {/* 📋 테두리가 추가된 메인 보드 */}
      <div className="admin-board">
        <h2 className="admin-title" style={{ marginBottom: "40px" }}>
          📊 관리 시스템 메뉴
        </h2>

        <div className="admin-menu-grid">
          <div className="admin-menu-card" onClick={() => navigate("/admin/users")}>
            <span style={{ fontSize: "45px" }}>👥</span>
            <span className="admin-menu-text">회원 관리</span>
          </div>

          <div className="admin-menu-card" onClick={() => navigate("/admin/markets")}>
            <span style={{ fontSize: "45px" }}>🏪</span>
            <span className="admin-menu-text">사업자 관리</span>
          </div>

          <div className="admin-menu-card" onClick={() => navigate("/admin/reports")}>
            <span style={{ fontSize: "45px" }}>🚩</span>
            <span className="admin-menu-text">신고 관리</span>
          </div>

          <div className="admin-menu-card" onClick={() => navigate("/admin/notices")}>
            <span style={{ fontSize: "45px" }}>📢</span>
            <span className="admin-menu-text">공지 관리</span>
          </div>

          <div
            className="admin-menu-card"
            style={{ gridColumn: "span 2", flexDirection: "row", gap: "20px" }}
            onClick={() => navigate("/admin/statistics")}
          >
            <span style={{ fontSize: "35px" }}>📈</span>
            <span className="admin-menu-text">통계 조회 (Statistics)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
