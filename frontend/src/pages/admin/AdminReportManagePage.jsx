import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminReportManagePage = () => {
  const navigate = useNavigate();

  // 1. [데이터 바구니] 신고 내역 (State)
  // 플로우차트의 [접수, 처리 중, 완료] 상태를 반영한 가짜 데이터입니다.
  const [reports, setReports] = useState([
    { id: 1, date: "2026-04-24", reporter: "김철수", target: "불량판매자", reason: "허위 매물 등록", status: "접수" },
    { id: 2, date: "2026-04-24", reporter: "이영희", target: "악성유저", reason: "채팅창 욕설", status: "처리 중" },
  ]);

  // 2. [명세서 연동: PUT /admin/reports/{id}/status] 신고 처리 함수
  // 플로우차트의 [경고, 정지, 반려] -> [결과 통보] 흐름을 구현합니다.
  const handleReportAction = (id, reporter, action) => {
    if (window.confirm(`${reporter}님의 신고에 대해 [${action}] 조치를 취하시겠습니까?`)) {
      setReports(reports.map((r) => (r.id === id ? { ...r, status: action + " 완료" } : r)));

      // 플로우차트 마지막 단계: 신고자에게 결과 통보
      alert(`📢 신고자(${reporter}님)에게 [${action}] 처리 결과가 통보되었습니다.`);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>🚩 신고 관리 (Report Management)</h2>
        <button onClick={() => navigate("/admin/dashboard")} style={backBtnStyle}>
          뒤로가기
        </button>
      </div>
      <p>접수된 신고 내역을 검토하고 적절한 조치(경고, 정지 등)를 취합니다.</p>

      {/* 3. 신고 내역 테이블 (Table) */}
      <table style={tableStyle}>
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa" }}>
            <th style={thStyle}>신고일</th>
            <th style={thStyle}>신고자</th>
            <th style={thStyle}>피신고자</th>
            <th style={thStyle}>사유</th>
            <th style={thStyle}>상태</th>
            <th style={thStyle}>관리 액션</th>
          </tr>
        </thead>
        <tbody>
          {reports.length > 0 ? (
            reports.map((r) => (
              <tr key={r.id} style={{ textAlign: "center" }}>
                <td style={tdStyle}>{r.date}</td>
                <td style={tdStyle}>{r.reporter}</td>
                <td style={tdStyle}>{r.target}</td>
                <td style={tdStyle}>{r.reason}</td>
                <td style={tdStyle}>
                  <b style={{ color: r.status.includes("완료") ? "#999" : "red" }}>{r.status}</b>
                </td>
                <td style={tdStyle}>
                  {r.status.includes("완료") ? (
                    <span style={{ color: "#999", fontSize: "12px" }}>처리 완료</span>
                  ) : (
                    <>
                      <button style={warnBtnStyle} onClick={() => handleReportAction(r.id, r.reporter, "경고")}>
                        경고
                      </button>
                      <button style={suspendBtnStyle} onClick={() => handleReportAction(r.id, r.reporter, "정지")}>
                        정지
                      </button>
                      <button style={rejectBtnStyle} onClick={() => handleReportAction(r.id, r.reporter, "반려")}>
                        반려
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                신고 접수된 내역이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ── 스타일 코드 (신고 관리용 컬러 반영) ── */
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};
const thStyle = { borderBottom: "2px solid #eee", padding: "12px", color: "#666" };
const tdStyle = { borderBottom: "1px solid #eee", padding: "12px" };
const backBtnStyle = { padding: "8px 16px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "4px" };

// 조치 버튼 스타일들
const warnBtnStyle = {
  marginRight: "5px",
  padding: "5px 10px",
  backgroundColor: "#faad14",
  color: "#fff",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
};
const suspendBtnStyle = {
  marginRight: "5px",
  padding: "5px 10px",
  backgroundColor: "#ff4d4f",
  color: "#fff",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
};
const rejectBtnStyle = {
  padding: "5px 10px",
  backgroundColor: "#bfbfbf",
  color: "#fff",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
};

export default AdminReportManagePage;
