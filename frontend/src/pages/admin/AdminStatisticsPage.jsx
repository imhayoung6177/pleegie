import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCommon.css"; // 🎨 공통 디자인 설계도 연결

const AdminStatisticsPage = () => {
  const navigate = useNavigate();

  // 데이터 바구니
  const stats = [
    { label: "주간 신규 가입자", value: "128명", icon: "👥" },
    { label: "인기 품목", value: "청송 사과 (1,204회)", icon: "🍎" },
    { label: "저장된 레시피", value: "3,450건", icon: "🍳" },
    { label: "쿠폰 사용률", value: "78%", icon: "🎫" },
  ];

  return (
    // dashboard-mode 클래스로 회원관리와 똑같은 주방 배경을 적용합니다.
    <div className="admin-login-container dashboard-mode">
      {/*  상단 바 (Top Navigation) */}
      <nav className="admin-topnav">
        <div className="admin-topnav-left">
          <h1 className="admin-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            pleegie
          </h1>
        </div>
        <div className="admin-topnav-right">
          <span className="admin-user-info">👤 관리자님</span>
          <button className="admin-btn-logout" onClick={() => navigate("/admin/dashboard")}>
            뒤로가기
          </button>
        </div>
      </nav>

      {/*  메인 화이트 보드 (Admin Board) */}
      <div className="admin-board">
        <div style={{ marginBottom: "30px" }}>
          <h2 className="admin-title" style={{ marginBottom: 0 }}>
            📈 서비스 통계 모드
          </h2>
          <p style={{ color: "#888", fontSize: "14px" }}>플랫폼의 주요 지표와 성과를 한눈에 확인합니다.</p>
        </div>

        {/*  통계 카드 그리드 (Grid Area) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            width: "100%",
          }}
        >
          {stats.map((item, index) => (
            <div key={index} style={statCardStyle}>
              <span style={{ fontSize: "32px", marginBottom: "10px" }}>{item.icon}</span>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, color: "#888", fontSize: "14px" }}>{item.label}</p>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 추후 그래프가 들어갈 자리 (Placeholder) */}
        <div style={graphPlaceholderStyle}>
          <p style={{ color: "#aaa", fontSize: "15px" }}>📊 상세 트렌드 분석 그래프 준비 중...</p>
        </div>
      </div>
    </div>
  );
};

/* ── 내부 인테리어 ── */

const statCardStyle = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "25px",
  border: "1.5px solid #f5ede0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.2s",
};

const graphPlaceholderStyle = {
  marginTop: "30px",
  flex: 1,
  backgroundColor: "#fffbf4",
  borderRadius: "25px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  border: "1px dashed #e5d9cc",
};

export default AdminStatisticsPage;
