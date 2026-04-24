import React from "react";
import { useNavigate } from "react-router-dom";

const AdminStatisticsPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>📈 서비스 통계 (Statistics)</h2>
        <button onClick={() => navigate("/admin/dashboard")}>뒤로가기</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginTop: "20px" }}>
        <div style={statBox}>👥 주간 신규 가입자: 128명</div>
        <div style={statBox}>🍎 인기 품목: 청송 사과 (조회 1,204회)</div>
        <div style={statBox}>🍳 저장된 레시피: 3,450건</div>
        <div style={statBox}>🎫 쿠폰 사용률: 78%</div>
      </div>
    </div>
  );
};

const statBox = {
  padding: "30px",
  border: "1px solid #eee",
  borderRadius: "10px",
  backgroundColor: "#f9f9f9",
  fontWeight: "bold",
};
export default AdminStatisticsPage;
