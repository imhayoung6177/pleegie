import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminCommon.css";

const AdminMarketManagePage = () => {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]); // [비유: 실제 사업자 등록 명부]
  const [loading, setLoading] = useState(true);

  //  [해결 포인트] fetchMarkets 함수를 useEffect 안으로 옮겼습니다!
  useEffect(() => {
    const fetchMarkets = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get("/admin/markets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // 백엔드 AdminService.java의 getAllMarkets() 데이터 저장

        setMarkets(response.data.data || []);
      } catch (error) {
        console.error("사업자 목록 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets(); // 화면이 나타나자마자 실행!
  }, []); // [] : 처음 한 번만 실행해서 'Cascading renders' 에러를 방지합니다.

  // ✏️ 2. 사업자 승인/반려/정지 처리 함수
  const handleMarketAction = async (marketId, actionType, marketName) => {
    const token = localStorage.getItem("accessToken");

    let actionKorean = actionType === "approve" ? "승인" : "반려/정지";
    if (!window.confirm(`${marketName} 사업자를 ${actionKorean} 하시겠습니까?`)) return;

    try {
      // 백엔드 AdminService의 approveMarket 또는 rejectMarket 호출
      await axios.put(
        `/admin/markets/${marketId}/${actionType}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert(`✅ ${marketName} 사업자가 ${actionKorean} 처리되었습니다.`);

      // ✅ 처리 후 목록을 다시 불러와서 화면을 최신 상태로 바꿉니다.
      const response = await axios.get("http://localhost:8080/api/admin/markets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMarkets(response.data.data || []);
    } catch (error) {
      console.error("처리 실패:", error);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="admin-login-container dashboard-mode">
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

      <div className="admin-board">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="admin-title" style={{ marginBottom: 0 }}>
            🏪 사업자 관리 모드
          </h2>
          <p style={{ color: "#888", fontSize: "14px" }}>입점 신청 검토 및 영업 상태를 관리합니다.</p>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>아이디 (ID)</th>
                <th>상호명</th>
                <th>이메일</th>
                <th>상태</th>
                <th>관리 액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">데이터 로딩 중...</td>
                </tr>
              ) : markets.length > 0 ? (
                markets.map((market) => (
                  <tr key={market.id}>
                    <td>{market.loginId}</td>
                    <td style={{ fontWeight: "bold" }}>{market.name}</td>
                    <td>{market.email}</td>
                    <td>
                      <span
                        className={`status-badge ${market.status === "ACTIVE" ? "status-normal" : "status-stopped"}`}
                      >
                        {market.status === "ACTIVE" ? "영업중" : "정지/대기"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                        {market.status !== "ACTIVE" && (
                          <button
                            className="admin-action-btn"
                            style={{ backgroundColor: "#4caf50", color: "white" }}
                            onClick={() => handleMarketAction(market.id, "approve", market.name)}
                          >
                            승인
                          </button>
                        )}
                        <button
                          className="admin-action-btn"
                          style={{
                            backgroundColor: market.status === "ACTIVE" ? "#ff9800" : "#ff4d4f",
                            color: "white",
                          }}
                          onClick={() => handleMarketAction(market.id, "reject", market.name)}
                        >
                          {market.status === "ACTIVE" ? "영업 정지" : "반려"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: "40px", color: "#999" }}>
                    등록된 사업자가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMarketManagePage;
