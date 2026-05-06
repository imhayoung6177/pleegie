// src/pages/admin/AdminReportManagePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCommon.css";
import axios from "axios";

const AdminReportManagePage = () => {
  const navigate = useNavigate();

  // ── 신고 목록 상태 ────────────────────────────────────
  const [reports, setReports] = useState([]);

  // ── 모달 상태 ─────────────────────────────────────────
  // viewModalOpen: 모달 열림/닫힘 여부
  // selectedReport: 모달에 표시할 신고 데이터
  const [viewModalOpen, setViewModalOpen]   = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // ── 토큰 헤더 생성 함수 ───────────────────────────────
  // 모든 API 요청에 공통으로 사용하는 Authorization 헤더
  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  // ── 신고 목록 조회 (GET /admin/reports) ──────────────
  const fetchReports = async () => {
    try {
      const response = await axios.get("/admin/reports", {
        headers: authHeader(),
      });
      // ApiResponse 구조: { success, message, data: [...] }
      // data가 없으면 response.data 자체를 배열로 시도, 그래도 없으면 빈 배열
      setReports(response.data.data || response.data || []);
    } catch (error) {
      console.error("신고 목록 로딩 실패:", error);
    }
  };

  // 컴포넌트 최초 렌더링 시 목록 1회 조회
  useEffect(() => { fetchReports(); }, []);

  // ── 신고 처리 함수 (PUT /admin/reports/{id}/status) ──
  // actionLabel: "처리중" | "완료" | "반려"
  const handleReportAction = async (id, actionLabel) => {
    // 관리자가 직접 입력할 알림 메시지 프롬프트
    const customMessage = window.prompt(
      `[${actionLabel}] 처리를 위한 알림 메시지를 입력해주세요.`,
      `신고하신 건에 대해 ${actionLabel} 처리되었습니다.`
    );

    // 취소 버튼 누르면 null 반환 → 그냥 종료
    if (customMessage === null) return;
    if (customMessage.trim() === "") {
      alert("알림 메시지를 입력해야 처리가 완료됩니다.");
      return;
    }

    try {
      await axios.put(
        `/admin/reports/${id}/status`,
        { status: actionLabel, message: customMessage },
        { headers: authHeader() }
      );

      alert("✅ 처리가 완료되었습니다.");

      // 목록에서 해당 신고의 status만 변경 (전체 재조회 없이 즉시 UI 반영)
      // prev.map: 모든 항목 순회 → id가 일치하면 status 교체, 아니면 그대로
      setReports(prev =>
        prev.map(r => (r.id === id ? { ...r, status: actionLabel } : r))
      );

      // 모달이 열려있고, 처리한 신고가 현재 모달에 표시 중이면 모달 내부도 동기화
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport(prev => ({ ...prev, status: actionLabel }));
      }
    } catch (error) {
      console.error("처리 실패:", error);
      alert(error.response?.data?.message || "처리 중 오류가 발생했습니다.");
    }
  };

  // ── ✅ 신고 삭제 함수 (DELETE /admin/reports/{id}) ───
  // 관리자는 상태와 무관하게 모든 신고를 삭제할 수 있습니다.
  // ⚠️ 백엔드 AdminController에 DELETE 엔드포인트 추가 필요 (아래 안내 참고)
  const handleDelete = async (id) => {
    if (!window.confirm("이 신고 내역을 완전히 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.")) return;

    try {
      await axios.delete(`/admin/reports/${id}`, {
        headers: authHeader(),
      });

      alert("✅ 신고가 삭제되었습니다.");

      // 모달 닫기
      setViewModalOpen(false);
      setSelectedReport(null);

      // 목록에서 삭제된 항목 즉시 제거
      // filter: id가 일치하지 않는 항목만 남김 (= 삭제된 항목 제거)
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("신고 삭제 실패:", error);
      alert(error.response?.data?.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  // ── 상태값 한글 변환 ──────────────────────────────────
  // DB에 저장된 영문 상태값을 화면에 표시할 한글로 변환합니다.
  const statusLabel = (status) => {
    if (status === "PENDING") return "접수";
    return status; // "처리중", "완료", "반려"는 그대로 표시
  };

  // ── 처리 완료 여부 판별 ───────────────────────────────
  // "완료" 또는 "반려" 상태면 더 이상 처리 버튼을 표시하지 않습니다.
  const isDone = (status) => status === "완료" || status === "반려";

  // ════════════════════════════════════════════════════
  // 📌 JSX 렌더링
  // ════════════════════════════════════════════════════
  return (
    <div className="admin-login-container dashboard-mode">

      {/* ── 상단 네비게이션 ── */}
      <nav className="admin-topnav">
        <div className="admin-topnav-left">
          <h1
            className="admin-logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            pleegie
          </h1>
        </div>
        <div className="admin-topnav-right">
          <span className="admin-user-info">👤 관리자님</span>
          <button
            className="admin-btn-logout"
            onClick={() => navigate("/admin/dashboard")}
          >
            뒤로가기
          </button>
        </div>
      </nav>

      {/* ── 메인 보드 ── */}
      <div className="admin-board">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="admin-title" style={{ marginBottom: 0 }}>
            🚩 신고 관리 모드
          </h2>
          <p style={{ color: "#888", fontSize: "14px" }}>
            접수된 민원을 검토하고 경고/정지 조치를 결정합니다.
          </p>
        </div>

        {/*
          table-layout: fixed 핵심 개념
          - 기본 테이블: 내용 길이에 따라 칸 너비 자동 결정 (레이아웃 무너짐)
          - fixed: colgroup에서 내가 지정한 너비가 우선 적용 (레이아웃 고정)
        */}
        <div className="admin-table-container">
          <table className="admin-table" style={{ tableLayout: "fixed", width: "100%" }}>
            <colgroup>
              {/* 신고일 | 접수자 | 제목(남은공간 자동) | 상태 | 관리처리 | ✅삭제 */}
              <col style={{ width: "90px" }} />
              <col style={{ width: "80px" }} />
              <col />
              <col style={{ width: "70px" }} />
              <col style={{ width: "190px" }} />
              <col style={{ width: "70px" }} /> {/* ✅ 삭제 컬럼 너비 */}
            </colgroup>

            <thead>
              <tr>
                <th>신고일</th>
                <th>접수자</th>
                <th style={{ textAlign: "left", paddingLeft: "12px" }}>제목</th>
                <th>상태</th>
                <th>관리 처리</th>
                <th>삭제</th> {/* ✅ 삭제 헤더 */}
              </tr>
            </thead>

            <tbody>
              {reports.length > 0 ? (
                reports.map((r) => (
                  <tr key={r.id}>

                    {/* 신고일: 줄바꿈 금지 */}
                    <td style={{ whiteSpace: "nowrap", fontSize: "13px", color: "#888" }}>
                      {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                    </td>

                    {/* 접수자: 줄바꿈 금지 */}
                    <td style={{ whiteSpace: "nowrap", fontWeight: "600", fontSize: "14px",color: "1a1a1a" }}>
                      {r.writerName || "-"}
                    </td>

                    {/*
                      제목: 클릭 → 상세보기 모달 오픈
                      말줄임(...) 적용 조건 3가지를 반드시 함께 써야 합니다:
                      1. overflow: hidden   → 넘치는 텍스트 숨김
                      2. whiteSpace: nowrap → 줄바꿈 금지
                      3. textOverflow: ellipsis → 넘친 부분을 ...으로 표시
                      maxWidth: 0 → table-layout:fixed 환경에서 ellipsis 동작의 핵심 트릭
                    */}
                    <td
                      style={{
                        textAlign: "left", paddingLeft: "12px",
                        cursor: "pointer", color: "#1a1a1a", fontWeight: "bold",
                        overflow: "hidden", whiteSpace: "nowrap",
                        textOverflow: "ellipsis", maxWidth: "0",
                      }}
                      onClick={() => { setSelectedReport(r); setViewModalOpen(true); }}
                      title={r.title || "(제목 없음)"} // 마우스 올리면 전체 제목 툴팁
                    >
                      {r.title || "(제목 없음)"}
                    </td>

                    {/* 상태 배지 */}
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span className={`status-badge ${isDone(r.status) ? "status-normal" : "status-stopped"}`}>
                        {statusLabel(r.status)}
                      </span>
                    </td>

                    {/* 관리 액션 버튼들 */}
                    <td style={{ whiteSpace: "nowrap" }}>
                      {isDone(r.status) ? (
                        // 완료/반려 상태면 버튼 대신 텍스트 표시
                        <span style={{ color: "#999", fontSize: "12px" }}>처리 완료</span>
                      ) : (
                        <div style={{ display: "flex", gap: "4px", justifyContent: "center", flexWrap: "nowrap" }}>
                          <button
                            className="admin-action-btn"
                            style={{ backgroundColor: "#fdd537", color: "#1a1a1a", whiteSpace: "nowrap" }}
                            onClick={() => handleReportAction(r.id, "처리중")}
                          >
                            처리중
                          </button>
                          <button
                            className="admin-action-btn"
                            style={{ backgroundColor: "#ff4d4f", color: "white", whiteSpace: "nowrap" }}
                            onClick={() => handleReportAction(r.id, "완료")}
                          >
                            완료
                          </button>
                          <button
                            className="admin-action-btn"
                            style={{ backgroundColor: "#bfbfbf", color: "#1a1a1a", whiteSpace: "nowrap" }}
                            onClick={() => handleReportAction(r.id, "반려")}
                          >
                            반려
                          </button>
                        </div>
                      )}
                    </td>

                    {/*
                      ✅ 삭제 버튼 컬럼
                      관리자는 상태와 무관하게 모든 신고 삭제 가능
                      테이블 행에서 바로 삭제할 수 있어 관리 효율 향상
                    */}
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(r.id)}
                        style={{
                          background: "none",
                          border: "1.5px solid #ff4d4f",
                          borderRadius: "6px",
                          color: "#ff4d4f",
                          fontSize: "13px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                        title="신고 내역 삭제"
                      >
                        삭제
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  {/* colSpan을 6으로 수정 (컬럼이 6개로 늘었으므로) */}
                  <td colSpan="6" style={{ padding: "40px", color: "#999" }}>
                    접수된 불편사항이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          📌 신고 상세보기 모달
          - viewModalOpen && selectedReport 둘 다 true일 때만 렌더링
          - 오버레이 클릭 → 모달 닫기
          - 모달 내부 클릭 → e.stopPropagation()으로 닫힘 방지
      ════════════════════════════════════════════════ */}
      {viewModalOpen && selectedReport && (
        <div
          className="admin-modal-overlay"
          onClick={() => setViewModalOpen(false)}
        >
          <div
            className="admin-modal-content report-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 신고 제목 */}
            <h2 style={{ color: "#1a1a1a", marginBottom: "12px", fontSize: "20px" }}>
              🚩 {selectedReport.title || "(제목 없음)"}
            </h2>

            {/* 메타 정보: 접수자, 신고일, 상태 */}
            <div className="report-detail-meta">
              <span>👤 접수자: {selectedReport.writerName || "-"}</span>
              <span>📅 신고일: {new Date(selectedReport.createdAt).toLocaleDateString("ko-KR")}</span>
              <span>
                🔖 상태:{" "}
                <strong style={{ color: isDone(selectedReport.status) ? "#2e7d32" : "#c62828" }}>
                  {statusLabel(selectedReport.status)}
                </strong>
              </span>
            </div>

            {/* 신고 내용 본문 */}
            <div style={{ marginBottom: "20px" }}>
              <p className="admin-label" style={{ marginBottom: "8px" }}>📄 신고 내용</p>
              <div className="report-detail-content">
                {selectedReport.content || "내용이 없습니다."}
              </div>
            </div>

            {/* 처리 버튼: 완료/반려 상태가 아닐 때만 표시 */}
            {!isDone(selectedReport.status) && (
              <div style={{ marginBottom: "16px" }}>
                <p className="admin-label" style={{ marginBottom: "8px" }}>어떻게 처리할까요?</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="admin-action-btn"
                    style={{ backgroundColor: "#fdd537", color: "#1a1a1a", flex: 1, height: "40px", fontSize: "13px" }}
                    onClick={() => handleReportAction(selectedReport.id, "처리중")}
                  >
                    처리중
                  </button>
                  <button
                    className="admin-action-btn"
                    style={{ backgroundColor: "#ff4d4f", color: "white", flex: 1, height: "40px", fontSize: "13px" }}
                    onClick={() => handleReportAction(selectedReport.id, "완료")}
                  >
                    완료
                  </button>
                  <button
                    className="admin-action-btn"
                    style={{ backgroundColor: "#bfbfbf", color: "#1a1a1a", flex: 1, height: "40px", fontSize: "13px" }}
                    onClick={() => handleReportAction(selectedReport.id, "반려")}
                  >
                    반려
                  </button>
                </div>
              </div>
            )}

            {/*
              ✅ 모달 안에서도 삭제 버튼 제공
              상세 내용을 확인하고 바로 삭제 결정 가능 → 관리 효율 향상
            */}
            <button
              onClick={() => handleDelete(selectedReport.id)}
              style={{
                width: "100%", height: "45px",
                background: "#fff", color: "#ff4d4f",
                border: "2px solid #ff4d4f",
                borderRadius: "12px",
                fontSize: "14px", fontWeight: "bold",
                marginBottom: "8px", cursor: "pointer",
              }}
            >
              🗑️ 이 신고 삭제하기
            </button>

            {/* 닫기 버튼 */}
            <button
              className="admin-action-btn"
              style={{
                backgroundColor: "#fdd537", color: "#1a1a1a",
                width: "100%", height: "45px",
                fontSize: "15px", fontWeight: "bold",
                marginTop: "4px",
              }}
              onClick={() => setViewModalOpen(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportManagePage;