import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCommon.css"; // 🎨 공통 디자인 설계도 연결
import axios from "axios";

const AdminReportManagePage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get("/admin/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(response.data.data || []);
      } catch (error) {
        console.error("신고 목록 로딩 실패:", error);
      }
    };
    fetchReports();
  }, []);

  // 2. 신고 처리 함수
  // 관리자가 결정을 내리면 장부를 업데이트하고 신고자에게 알림을 보냅니다.
 const handleReportAction = async (id, status) => {
  const token = localStorage.getItem("accessToken");
  if (!window.confirm(`처리하시겠습니까?`)) return;

  try {
    await axios.put(
      `/admin/reports/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    alert("✅ 처리 완료되었습니다.");
  } catch (error) {
    console.error("처리 실패:", error);
    alert("처리 중 오류가 발생했습니다.");
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
                <th>접수자</th>
                <th>제목</th>
                <th>내용</th>
                <th>상태</th>
                <th>관리 액션</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td>{r.writerName || '-'}</td>
                    <td style={{ fontWeight: "bold" }}>{r.title || '-'}</td>
                    <td style={{ textAlign: "left" }}>{r.content}</td>
                    <td>
                      {/* 상태에 따른 배지 색상 구분 */}
                      <span
                        className={`status-badge ${r.status === "RESOLVED" ? "status-normal" : "status-stopped"}`}
                      >
                        {r.status === "PENDING" ? "접수" : r.status === "IN_PROGRESS" ? "처리 중" : "완료"}
                      </span>
                    </td>
                    <td>
                      {/* 조건부 렌더링: 처리가 끝나지 않은 건만 버튼 노출 */}
                      {r.status === "RESOLVED" ? (
                      <span style={{ color: "#999", fontSize: "12px" }}>처리 완료</span>
                    ) : (
                      <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                        <button className="admin-action-btn"
                          style={{ backgroundColor: "#faad14", color: "white" }}
                          onClick={() => handleReportAction(r.id, "IN_PROGRESS")}>처리중</button>
                        <button className="admin-action-btn"
                          style={{ backgroundColor: "#ff4d4f", color: "white" }}
                          onClick={() => handleReportAction(r.id, "RESOLVED")}>완료</button>
                        <button className="admin-action-btn"
                          style={{ backgroundColor: "#bfbfbf", color: "white" }}
                          onClick={() => handleReportAction(r.id, "REJECTED")}>반려</button>
                      </div>
                    )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", color: "#999" }}>
                    접수된 불편사항이 없습니다.
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
