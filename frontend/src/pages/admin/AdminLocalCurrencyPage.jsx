import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCommon.css";

// ════════════════════════════════════════════════════════
// 📌 API 설정
// ════════════════════════════════════════════════════════
const BASE_URL = "http://localhost:8080";

const getAdminAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

// ════════════════════════════════════════════════════════
// 📌 API 함수 (주소와 Method를 백엔드와 맞췄습니다)
// ════════════════════════════════════════════════════════

/** GET /admin/local-currency?status=REQUESTED */
const fetchAllLogs = async (statusFilter) => {
  const url = statusFilter
    ? `${BASE_URL}/admin/local-currency?status=${statusFilter}`
    : `${BASE_URL}/admin/local-currency`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAdminAuthHeaders(),
  });
  if (!response.ok) throw new Error(`조회 실패: ${response.status}`);
  const result = await response.json();
  return result.data || result || [];
};

/** PUT /admin/local-currency/{id}/approve */
const approveCurrencyApi = async (logId) => {
  const response = await fetch(`${BASE_URL}/admin/local-currency/${logId}/approve`, {
    method: "PUT",
    headers: getAdminAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || `승인 실패: ${response.status}`);
  }
  return await response.json();
};

/** PUT /admin/local-currency/{id}/reject */
const rejectCurrencyApi = async (logId) => {
  const response = await fetch(`${BASE_URL}/admin/local-currency/${logId}/reject`, {
    method: "PUT",
    headers: getAdminAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || `반려 실패: ${response.status}`);
  }
  return await response.json();
};

// ════════════════════════════════════════════════════════
// 📌 헬퍼 함수
// ════════════════════════════════════════════════════════
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("ko-KR");
};

// ════════════════════════════════════════════════════════
// 📌 메인 컴포넌트
// ════════════════════════════════════════════════════════
const AdminLocalCurrencyPage = () => {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("REQUESTED");
  const [processingId, setProcessingId] = useState(null);

  // 🚀 새로고침 스위치 (Trigger)
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 통계 계산
  const totalStats = {
    REQUESTED: allLogs.filter((d) => d.status === "REQUESTED").length,
    ISSUED: allLogs.filter((d) => d.status === "ISSUED").length,
    REJECTED: allLogs.filter((d) => d.status === "REJECTED").length,
  };

  // ── 데이터 로드 (useEffect 내부에 캡슐화) ──
  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAllLogs(statusFilter);
        setLogs(data);

        const allData = await fetchAllLogs(null);
        setAllLogs(allData);
      } catch (err) {
        console.error("데이터 로드 에러:", err);
        setError(`목록을 불러오는 데 실패했습니다. (${err.message})`);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, [statusFilter, refreshTrigger]); // 스위치가 눌리면 다시 실행!

  // ── 승인 핸들러 ──
  const handleApprove = async (log) => {
    if (!window.confirm(`${log.userName}님 신청을 승인하시겠습니까?`)) return;

    setProcessingId(log.id);
    try {
      await approveCurrencyApi(log.id);
      alert(`✅ 승인 완료`);
      setRefreshTrigger((prev) => prev + 1); // 스위치 딸깍!
    } catch (err) {
      alert(`❌ 승인 실패: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // ── 반려 핸들러 ──
  const handleReject = async (log) => {
    if (!window.confirm(`${log.userName}님의 신청을 반려하시겠습니까?`)) return;

    setProcessingId(log.id);
    try {
      await rejectCurrencyApi(log.id);
      alert("반려 처리되었습니다.");
      setRefreshTrigger((prev) => prev + 1); // 스위치 딸깍!
    } catch (err) {
      alert(`❌ 반려 실패: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // ── 새로고침 버튼 핸들러 ──
  const handleManualRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
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
            💸 지역화폐 관리
          </h2>
          <p style={{ color: "#888", fontSize: "14px" }}>신청 목록을 확인하고 승인 또는 반려 처리합니다.</p>
        </div>

        {/* 통계 카드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
          {[
            { key: "REQUESTED", label: "⏳ 승인 대기", color: "#f59e0b", activeBg: "#fff8e1", activeBorder: "#fdd537" },
            { key: "ISSUED", label: "✅ 승인", color: "#4caf50", activeBg: "#e8f5e9", activeBorder: "#4caf50" },
            { key: "REJECTED", label: "❌ 반려", color: "#e53535", activeBg: "#ffebee", activeBorder: "#e53535" },
          ].map((card) => (
            <div
              key={card.key}
              onClick={() => setStatusFilter(card.key)}
              style={{
                background: statusFilter === card.key ? card.activeBg : "#fff",
                border: `2px solid ${statusFilter === card.key ? card.activeBorder : "#eee"}`,
                borderRadius: "12px",
                padding: "14px 20px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: card.color }}>{totalStats[card.key]}건</div>
              <div style={{ fontSize: "0.82rem", color: "#888", marginTop: "4px" }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* 탭 및 새로고침 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
          {["REQUESTED", "ISSUED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: "7px 18px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                border: statusFilter === status ? "2px solid #2a1f0e" : "2px solid #ddd",
                background: statusFilter === status ? "#2a1f0e" : "#fff",
                color: statusFilter === status ? "#fdd537" : "#555",
              }}
            >
              {status === "REQUESTED" ? "⏳ 대기" : status === "ISSUED" ? "✅ 승인" : "❌ 반려"}
            </button>
          ))}
          <button
            onClick={handleManualRefresh}
            style={{
              marginLeft: "auto",
              padding: "7px 14px",
              borderRadius: "10px",
              border: "2px solid #eee",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            🔄
          </button>
        </div>

        <div className="admin-table-container">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>⏳ 불러오는 중...</div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#e53535" }}>
              <p>{error}</p>
              <button
                onClick={handleManualRefresh}
                style={{
                  marginTop: "10px",
                  padding: "8px 20px",
                  background: "#e53535",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                다시 시도
              </button>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>신청일</th>
                  <th>신청자</th>
                  <th>시장명</th>
                  <th>금액</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatDate(log.requestedAt)}</td>
                      <td style={{ fontWeight: "bold" }}>{log.userName}</td>
                      <td>🏪 {log.marketName}</td>
                      <td>{log.amount?.toLocaleString()}원</td>
                      <td>
                        <span
                          className={`status-badge ${log.status === "ISSUED" ? "status-normal" : log.status === "REJECTED" ? "status-stopped" : "status-warning"}`}
                        >
                          {log.status === "REQUESTED" ? "대기" : log.status === "ISSUED" ? "승인" : "반려"}
                        </span>
                      </td>
                      <td>
                        {log.status === "REQUESTED" ? (
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button
                              className="admin-action-btn"
                              style={{ backgroundColor: "#4caf50", color: "white" }}
                              onClick={() => handleApprove(log)}
                              disabled={processingId === log.id}
                            >
                              승인
                            </button>
                            <button
                              className="admin-action-btn"
                              style={{ backgroundColor: "#bfbfbf", color: "white" }}
                              onClick={() => handleReject(log)}
                              disabled={processingId === log.id}
                            >
                              반려
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "#999", fontSize: "12px" }}>처리 완료</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: "40px", color: "#999" }}>
                      내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLocalCurrencyPage;
