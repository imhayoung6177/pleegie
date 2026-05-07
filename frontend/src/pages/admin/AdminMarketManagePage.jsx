import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminCommon.css";

const AdminMarketManagePage = () => {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── 1. 데이터 로딩 (useEffect 안으로 안전하게 이동) ──
  useEffect(() => {
    const fetchMarkets = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get("/admin/markets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMarkets(response.data.data || []);
      } catch (error) {
        console.error("사업자 목록 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []); // [] : 처음 한 번만 실행하여 무한 루프 방지

  // ── 2. 승인/반려 처리 함수 ──
  const handleMarketAction = async (marketId, actionType, marketName) => {
    const token = localStorage.getItem("accessToken");
    let actionKorean = actionType === "approve" ? "승인" : "반려/정지";

    if (!window.confirm(`${marketName} 사업자를 ${actionKorean} 하시겠습니까?`)) return;

    try {
      // API 호출 (백엔드 경로와 일치해야 합니다)
      await axios.put(
        `/admin/markets/${marketId}/${actionType}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert(`✅ ${marketName} 사업자가 ${actionKorean} 처리되었습니다.`);

      // 처리 후 목록 새로고침
      const response = await axios.get("/admin/markets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMarkets(response.data.data || []);
    } catch (error) {
      console.error("처리 실패:", error);
      alert("처리 중 오류가 발생했습니다. 서버 상태를 확인해주세요.");
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
          <h2 className="admin-title">🏪 사업자 관리 모드</h2>
          <p style={{ color: "#888", fontSize: "14px" }}>입점 신청 검토 및 영업 상태를 관리합니다.</p>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>아이디 (ID)</th>
                <th>대표명</th>
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
                    <td>{market.email || "정보 없음"}</td>
                    <td>
                      {/* [핵심] PENDING 상태일 때 노란색 '인증대기' 표시 */}
                      <span
                        className={`status-badge ${market.status === "APPROVED" ? "status-normal" : "status-warning"}`}
                      >
                        {market.status === "PENDING"
                          ? "⏳ 인증대기"
                          : market.status === "APPROVED"
                            ? "✅ 영업중"
                            : "🚫 정지/반려"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                        {market.status === "PENDING" && (
                          <button
                            className="admin-action-btn"
                            style={{ backgroundColor: "#fdd537", color: "#1a1a1a" }}
                            onClick={() => handleMarketAction(market.id, "approve", market.name)}
                          >
                            승인
                          </button>
                        )}
                        <button
                          className="admin-action-btn"
                          style={{ backgroundColor: market.status === "APPROVED" ? "#ff4d4f" : "#666", color: "white" }}
                          onClick={() => handleMarketAction(market.id, "reject", market.name)}
                        >
                          {market.status === "APPROVED" ? "영업 정지" : "반려"}
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
