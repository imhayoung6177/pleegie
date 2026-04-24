import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 관리자 대시보드</h1>

      {/* 2열에서 3열 구조로 변경하거나, 아래에 추가할 수 있습니다. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr", // 지금은 2줄씩 나오게 되어 있어요.
          gap: "15px",
        }}
      >
        <div style={btnStyle} onClick={() => navigate("/admin/users")}>
          👥 회원 관리
        </div>
        <div style={btnStyle} onClick={() => navigate("/admin/markets")}>
          🏪 사업자 관리
        </div>
        <div style={btnStyle} onClick={() => navigate("/admin/reports")}>
          🚩 신고 관리
        </div>
        <div style={btnStyle} onClick={() => navigate("/admin/notices")}>
          📢 공지 관리
        </div>
        <div
          style={{ ...btnStyle, gridColumn: "span 2", backgroundColor: "#f0f7ff" }}
          onClick={() => navigate("/admin/statistics")}
        >
          📈 통계 조회 (Statistics)
        </div>
      </div>
    </div>
  );
};

// 버튼 공통 스타일
const btnStyle = {
  border: "1px solid #ddd",
  padding: "20px",
  borderRadius: "8px",
  cursor: "pointer",
  textAlign: "center",
  fontSize: "18px",
  fontWeight: "bold",
  transition: "0.2s",
};

export default AdminDashboardPage;
