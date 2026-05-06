import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminCommon.css";

const AdminMarketManagePage = () => {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]); // 사업자 목록 바구니
  const [loading, setLoading] = useState(true);

  // ── 1. 데이터 로드 (컴포넌트가 처음 나타날 때 한 번만 실행) ──
  useEffect(() => {
    const fetchMarkets = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        setLoading(true);
        // 백엔드 AdminService의 getAllMarkets() 호출
        const response = await axios.get("/admin/markets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // 응답 데이터 저장 (DTO에 status 필드가 포함되어 있어야 함)
        setMarkets(response.data.data || []);
      } catch (error) {
        console.error("사업자 목록 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []); // 빈 배열: 마운트 시 1회 실행

  // ── 2. 공통 새로고침 함수 (액션 처리 후 목록 갱신용) ──
  const refreshMarkets = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await axios.get("/admin/markets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMarkets(response.data.data || []);
    } catch (error) {
      console.error("목록 갱신 실패:", error);
    }
  };

  // ── 3. 사업자 액션 처리 (승인 / 반려 / 정지) ──
  const handleMarketAction = async (marketId, actionType, marketName) => {
    const token = localStorage.getItem("accessToken");

    // 한국어 문구 변환 (UI용)
    let actionKorean = "";
    if (actionType === "approve") actionKorean = "승인";
    else if (actionType === "reject") actionKorean = "반려";
    else actionKorean = "정지";

    if (!window.confirm(`${marketName} 사업자를 ${actionKorean} 하시겠습니까?`)) return;

    try {
      // 백엔드 AdminController의 @PutMapping 엔드포인트 호출
      await axios.put(
        `/admin/markets/${marketId}/${actionType}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert(`✅ ${marketName} 사업자가 ${actionKorean} 처리되었습니다.`);

      // 💡 처리 성공 후 목록을 다시 불러와 화면을 동기화합니다.
      await refreshMarkets();
    } catch (error) {
      console.error(`${actionKorean} 처리 실패:`, error);
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

                    {/* ✅ 1. 상태 텍스트 분기 처리 (Wording) */}
                    <td>
                      <span
                        className={`status-badge ${market.status === "ACTIVE" ? "status-normal" : "status-warning"}`}
                      >
                        {market.status === "PENDING"
                          ? "⏳ 인증 대기"
                          : market.status === "ACTIVE"
                            ? "✅ 영업중"
                            : "🚫 정지/반려"}
                      </span>
                    </td>

                    {/* ✅ 2. 관리 버튼 분기 처리 (Condition) */}
                    <td>
                      <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                        {/* [상태가 PENDING일 때만] 승인 및 반려 버튼 노출 */}
                        {market.status === "PENDING" && (
                          <>
                            <button
                              className="admin-action-btn"
                              style={{ backgroundColor: "#4caf50", color: "white" }}
                              onClick={() => handleMarketAction(market.id, "approve", market.name)}
                            >
                              승인
                            </button>
                            <button
                              className="admin-action-btn"
                              style={{ backgroundColor: "#ff4d4f", color: "white" }}
                              onClick={() => handleMarketAction(market.id, "reject", market.name)}
                            >
                              반려
                            </button>
                          </>
                        )}

                        {/* [상태가 ACTIVE(영업중)일 때만] 정지 버튼 노출 */}
                        {market.status === "ACTIVE" && (
                          <button
                            className="admin-action-btn"
                            style={{ backgroundColor: "#ff9800", color: "white" }}
                            onClick={() => handleMarketAction(market.id, "reject", market.name)}
                          >
                            영업 정지
                          </button>
                        )}
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
