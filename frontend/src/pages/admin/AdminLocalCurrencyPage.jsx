import React, { useState, useEffect, useCallback } from "react";
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
// 📌 API 함수
// ════════════════════════════════════════════════════════

/** GET /admin/local-currency/logs?status=REQUESTED */
const fetchAllLogs = async (statusFilter) => {
  const url = statusFilter
    ? `${BASE_URL}/admin/local-currency/logs?status=${statusFilter}`
    : `${BASE_URL}/admin/local-currency/logs`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAdminAuthHeaders(),
  });
  if (!response.ok) throw new Error(`조회 실패: ${response.status}`);
  const result = await response.json();
  return result.data || result || [];
};

/** PATCH /admin/local-currency/logs/{id}/approve */
const approveCurrencyApi = async (logId) => {
  const response = await fetch(
    `${BASE_URL}/admin/local-currency/logs/${logId}/approve`,
    { method: "PATCH", headers: getAdminAuthHeaders() }
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || `승인 실패: ${response.status}`);
  }
  return await response.json();
};

/** PATCH /admin/local-currency/logs/{id}/reject */
const rejectCurrencyApi = async (logId) => {
  const response = await fetch(
    `${BASE_URL}/admin/local-currency/logs/${logId}/reject`,
    { method: "PATCH", headers: getAdminAuthHeaders() }
  );
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

  const [logs, setLogs]                   = useState([]);
  const [allLogs, setAllLogs]             = useState([]); // 통계용 전체 목록
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState(null);
  const [statusFilter, setStatusFilter]   = useState("REQUESTED");
  const [processingId, setProcessingId]   = useState(null);

  // 통계: 전체 목록 기준으로 계산
  const totalStats = {
    REQUESTED: allLogs.filter((d) => d.status === "REQUESTED").length,
    ISSUED:    allLogs.filter((d) => d.status === "ISSUED").length,
    REJECTED:  allLogs.filter((d) => d.status === "REJECTED").length,
  };

  // ── 데이터 로드 ───────────────────────────────────────
  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ✅ 실제 백엔드 API 호출 (목업 데이터 완전 제거)
      // 1. 현재 탭에 해당하는 목록
      const data = await fetchAllLogs(statusFilter);
      setLogs(data);

      // 2. 통계 카드용 전체 목록 (status 파라미터 없이)
      const allData = await fetchAllLogs(null);
      setAllLogs(allData);

    } catch (err) {
      console.error("지역화폐 목록 조회 실패:", err);
      if (err.message.includes("401")) {
        alert("로그인이 만료되었습니다.");
        navigate("/admin/login");
        return;
      }
      setError(`목록을 불러오는 데 실패했습니다. (${err.message})`);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, navigate]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  // ── 승인 핸들러 ───────────────────────────────────────
  const handleApprove = async (log) => {
    if (!window.confirm(
      `${log.userName}님의 ${log.amount?.toLocaleString()}원 신청을 승인하시겠습니까?\n\n✅ 승인 시 지역화폐가 문자로 발송됩니다.`
    )) return;

    setProcessingId(log.id);
    try {
      await approveCurrencyApi(log.id);
      alert(`✅ ${log.userName}님 신청이 승인되었습니다.\n지역화폐가 문자로 발송됩니다.`);
      await loadLogs(); // 승인 후 목록 새로고침
    } catch (err) {
      alert(`❌ 승인 실패: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // ── 반려 핸들러 ───────────────────────────────────────
  const handleReject = async (log) => {
    if (!window.confirm(`${log.userName}님의 신청을 반려하시겠습니까?`)) return;

    setProcessingId(log.id);
    try {
      await rejectCurrencyApi(log.id);
      alert("반려 처리되었습니다.");
      await loadLogs(); // 반려 후 목록 새로고침
    } catch (err) {
      alert(`❌ 반려 실패: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // ════════════════════════════════════════════════════
  // 📌 렌더링 - 디자인 변경 없음
  // ════════════════════════════════════════════════════
  return (
    <div className="admin-login-container dashboard-mode">

      {/* 상단 네비게이션 */}
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

      {/* 메인 보드 */}
      <div className="admin-board">

        {/* 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="admin-title" style={{ marginBottom: 0 }}>💸 지역화폐 관리</h2>
          <p style={{ color: "#888", fontSize: "14px" }}>
            신청 목록을 확인하고 승인 또는 반려 처리합니다. 승인 시 문자로 자동 발송됩니다.
          </p>
        </div>

        {/* 통계 카드 3개 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
          {[
            { key: "REQUESTED", label: "⏳ 승인 대기", color: "#f59e0b", activeBg: "#fff8e1", activeBorder: "#fdd537" },
            { key: "ISSUED",    label: "✅ 승인",      color: "#4caf50", activeBg: "#e8f5e9", activeBorder: "#4caf50" },
            { key: "REJECTED",  label: "❌ 반려",      color: "#e53535", activeBg: "#ffebee", activeBorder: "#e53535" },
          ].map((card) => (
            <div
              key={card.key}
              onClick={() => setStatusFilter(card.key)}
              style={{
                background: statusFilter === card.key ? card.activeBg : "#fff",
                border: `2px solid ${statusFilter === card.key ? card.activeBorder : "#eee"}`,
                borderRadius: "12px", padding: "14px 20px",
                cursor: "pointer", textAlign: "center", transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: card.color }}>
                {/* ✅ 실제 DB 데이터 기준 카운트 */}
                {totalStats[card.key]}건
              </div>
              <div style={{ fontSize: "0.82rem", color: "#888", marginTop: "4px" }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* 탭 + 새로고침 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
          {[
            { key: "REQUESTED", label: "⏳ 승인 대기" },
            { key: "ISSUED",    label: "✅ 승인" },
            { key: "REJECTED",  label: "❌ 반려" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: "7px 18px", borderRadius: "20px",
                fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                border: statusFilter === tab.key ? "2px solid #2a1f0e" : "2px solid #ddd",
                background: statusFilter === tab.key ? "#2a1f0e" : "#fff",
                color: statusFilter === tab.key ? "#fdd537" : "#555",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={loadLogs}
            title="새로고침"
            style={{
              marginLeft: "auto", padding: "7px 14px",
              borderRadius: "10px", border: "2px solid #eee",
              background: "#fff", cursor: "pointer", fontSize: "1rem",
            }}
          >
            🔄
          </button>
        </div>

        {/* 테이블 */}
        <div className="admin-table-container">

          {/* 로딩 */}
          {isLoading && (
            <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
              ⏳ 불러오는 중...
            </div>
          )}

          {/* 에러 */}
          {!isLoading && error && (
            <div style={{ textAlign: "center", padding: "40px", color: "#e53535" }}>
              <p>{error}</p>
              <button
                onClick={loadLogs}
                style={{
                  marginTop: "10px", padding: "8px 20px",
                  background: "#e53535", color: "#fff",
                  border: "none", borderRadius: "8px", cursor: "pointer",
                }}
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 정상 테이블 */}
          {!isLoading && !error && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>신청일</th>
                  <th>신청자</th>
                  <th>시장명</th>
                  <th>금액</th>
                  <th>처리일</th>
                  <th>처리자</th>
                  <th>상태</th>
                  <th>관리 액션</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatDate(log.requestedAt)}</td>
                      <td style={{ fontWeight: "bold" }}>{log.userName}</td>
                      <td>🏪 {log.marketName}</td>
                      <td style={{ fontWeight: "bold" }}>{log.amount?.toLocaleString()}원</td>
                      <td style={{ fontSize: "13px", color: "#888" }}>{formatDate(log.issuedAt)}</td>
                      <td style={{ fontSize: "13px", color: "#888" }}>{log.issuedByName || "-"}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            log.status === "ISSUED"   ? "status-normal"  :
                            log.status === "REJECTED" ? "status-stopped" : "status-warning"
                          }`}
                        >
                          {log.status === "REQUESTED" ? "대기" :
                           log.status === "ISSUED"    ? "승인" : "반려"}
                        </span>
                      </td>
                      <td>
                        {log.status === "REQUESTED" ? (
                          <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                            <button
                              className="admin-action-btn"
                              style={{ backgroundColor: "#4caf50", color: "white" }}
                              onClick={() => handleApprove(log)}
                              disabled={processingId === log.id}
                            >
                              {processingId === log.id ? "처리중..." : "승인"}
                            </button>
                            <button
                              className="admin-action-btn"
                              style={{ backgroundColor: "#bfbfbf", color: "white" }}
                              onClick={() => handleReject(log)}
                              disabled={processingId === log.id}
                            >
                              {processingId === log.id ? "처리중..." : "반려"}
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
                    <td colSpan="8" style={{ padding: "40px", color: "#999" }}>
                      해당 상태의 신청 내역이 없습니다.
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