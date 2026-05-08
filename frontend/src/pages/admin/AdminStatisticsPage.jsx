import React, { useState, useEffect } from "react"; // 사용하지 않는 useCallback 제거
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminCommon.css";

const AdminStatisticsPage = () => {
  const navigate = useNavigate();

  // ── 1. 데이터 바구니 (State) ────────────────
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── 2. 페이지가 열릴 때 데이터 가져오기 (Effect) ──
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken"); // 로그인 토큰 가져오기

        // 백엔드에 신분증(Token)을 지참해서 데이터를 요청합니다.
        const response = await axios.get("/admin/statistics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setStatistics(response.data.data);
        }
      } catch (error) {
        console.error("데이터 호출 실패:", error);
        if (error.response?.status === 401) {
          alert("로그인이 만료되었습니다.");
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]); // navigate가 바뀔 때만 실행 (사실상 처음 한 번)

  // ── 3. 로딩 화면 ────────────────────────────
  if (loading) {
    return (
      <div className="admin-login-container dashboard-mode">
        <div className="admin-board" style={{ justifyContent: "center", alignItems: "center", display: "flex" }}>
          <p>📊 실제 데이터를 집계 중입니다...</p>
        </div>
      </div>
    );
  }

  // ── 4. 카드 데이터 정리 ──────────────────────
  const statsCards = [
    { label: "주간 신규 가입자", value: `${statistics?.newUsersCount || 0}명`, icon: "👥" },
    {
      label: "인기 품목",
      value: `${statistics?.topItemName || "데이터 없음"} (${statistics?.topItemCount || 0}회)`,
      icon: "🍎",
    },
    { label: "저장된 레시피", value: `${statistics?.totalSavedRecipes || 0}건`, icon: "🍳" },
    { label: "지역화폐 발급률", value: `${statistics?.couponUsageRate || 0}%`, icon: "💸" },
  ];

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
        <div style={{ marginBottom: "30px" }}>
          <h2 className="admin-title" style={{ marginBottom: 0 }}>
            📈 서비스 통계 모드
          </h2>
          <p style={{ color: "#888", fontSize: "14px" }}>플랫폼의 주요 지표를 실시간으로 확인합니다.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", width: "100%" }}>
          {statsCards.map((item, index) => (
            <div key={index} style={statCardStyle}>
              <span style={{ fontSize: "32px", marginBottom: "10px" }}>{item.icon}</span>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, color: "#888", fontSize: "14px" }}>{item.label}</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "20px", fontWeight: "bold", color: "#333" }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
};

export default AdminStatisticsPage;
