import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCommon.css"; // 🎨 공통 디자인 설계도 연결

const AdminReportManagePage = () => {
  const navigate = useNavigate();

  // 1. 신고 내역 (State)
  const [reports, setReports] = useState([
    { id: 1, date: "2026-04-24", reporter: "김철수", target: "불량판매자", reason: "허위 매물 등록", status: "접수" },
    { id: 2, date: "2026-04-24", reporter: "이영희", target: "악성유저", reason: "채팅창 욕설", status: "처리 중" },
  ]);

  // 2. 신고 처리 함수
  // 관리자가 결정을 내리면 장부를 업데이트하고 신고자에게 알림을 보냅니다.
  const handleReportAction = (id, reporter, action) => {
    if (window.confirm(`${reporter}님의 신고에 대해 [${action}] 조치를 취하시겠습니까?`)) {
      // 1) 장부 업데이트: 해당 신고 건의 상태를 '완료'로 변경
      setReports(reports.map((r) => (r.id === id ? { ...r, status: action + " 완료" } : r)));

      // 2) 결과 통보: 실제 서비스에서는 알림톡이나 이메일 전송 API가 들어갈 자리입니다.
      alert(`📢 신고자(${reporter}님)에게 [${action}] 처리 결과가 통보되었습니다.`);
    }
  };

  return (
    // dashboard-mode 클래스로 통일된 배경 이미지를 적용합니다.
    <div className="admin-login-container dashboard-mode">
      {/* 상단 네비게이션 바 (Top Bar) */}
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

      {/* 메인 화이트 보드 (Admin Board) */}
      <div className="admin-board">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="admin-title" style={{ marginBottom: 0 }}>
            🚩 신고 관리 모드
          </h2>
          <p style={{ color: "#888", fontSize: "14px" }}>접수된 민원을 검토하고 경고/정지 조치를 결정합니다.</p>
        </div>

        {/* 테이블 영역 (Table Area) */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>신고일</th>
                <th>신고자</th>
                <th>피신고자</th>
                <th>사유</th>
                <th>상태</th>
                <th>관리 액션</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.reporter}</td>
                    <td style={{ fontWeight: "bold" }}>{r.target}</td>
                    <td style={{ textAlign: "left" }}>{r.reason}</td>
                    <td>
                      {/* 상태에 따른 배지 색상 구분 */}
                      <span
                        className={`status-badge ${r.status.includes("완료") ? "status-normal" : "status-stopped"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {/* 조건부 렌더링: 처리가 끝나지 않은 건만 버튼 노출 */}
                      {r.status.includes("완료") ? (
                        <span style={{ color: "#999", fontSize: "12px" }}>처리 완료</span>
                      ) : (
                        <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                          <button
                            className="admin-action-btn"
                            style={{ backgroundColor: "#faad14", color: "white" }}
                            onClick={() => handleReportAction(r.id, r.reporter, "경고")}
                          >
                            경고
                          </button>
                          <button
                            className="admin-action-btn"
                            style={{ backgroundColor: "#ff4d4f", color: "white" }}
                            onClick={() => handleReportAction(r.id, r.reporter, "정지")}
                          >
                            정지
                          </button>
                          <button
                            className="admin-action-btn"
                            style={{ backgroundColor: "#bfbfbf", color: "white" }}
                            onClick={() => handleReportAction(r.id, r.reporter, "반려")}
                          >
                            반려
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", color: "#999" }}>
                    접수된 신고 내역이 없습니다.
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

export default AdminReportManagePage;
