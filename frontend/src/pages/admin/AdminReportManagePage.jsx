import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCommon.css"; // 🎨 공통 디자인 설계도 연결
import axios from "axios";

const AdminReportManagePage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  // 🚀 [에러 해결] 함수를 useEffect 안으로 이동시켜 무한 렌더링 에러를 방지합니다.
  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get("/admin/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // 데이터 구조에 따라 안전하게 상태를 업데이트합니다.
        setReports(response.data.data || response.data || []);
      } catch (error) {
        console.error("신고 목록 로딩 실패:", error);
      }
    };

    fetchReports();
  }, []); // 👈 빈 배열([])은 컴포넌트가 처음 나타날 때 딱 한 번만 실행하라는 뜻입니다.

  /**
   * 2. 신고 처리 함수 (입력창 기능 포함)
   * actionLabel: 화면에 표시되는 "처리중", "완료", "반려" 글자
   */
  const handleReportAction = async (id, actionLabel) => {
    const token = localStorage.getItem("accessToken");

    // 🚀 [기능] 관리자에게 직접 메시지를 입력받습니다. (비전공자 비유: 직접 적는 쪽지)
    const customMessage = window.prompt(
      `[${actionLabel}] 처리를 위한 알림 메시지를 입력해주세요.`,
      `신고하신 건에 대해 ${actionLabel} 처리되었습니다.`,
    );

    // 취소를 누르면 중단
    if (customMessage === null) return;

    // 빈 메시지 방지
    if (customMessage.trim() === "") {
      alert("알림 메시지를 입력해야 처리가 완료됩니다.");
      return;
    }

    try {
      // 서버로 상태값(status)과 관리자가 쓴 메시지(message)를 함께 전송합니다.
      await axios.put(
        `/admin/reports/${id}/status`,
        {
          status: actionLabel,
          message: customMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("✅ 처리가 완료되었습니다.");
    } catch (error) {
      console.error("처리 실패:", error);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="admin-login-container dashboard-mode">
      {/* 상단 네비게이션 바 */}
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

      {/* 메인 관리 보드 */}
      <div className="admin-board">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="admin-title" style={{ marginBottom: 0 }}>
            🚩 신고 관리 모드
          </h2>
          <p style={{ color: "#888", fontSize: "14px" }}>접수된 민원을 검토하고 경고/정지 조치를 결정합니다.</p>
        </div>

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
                    <td>{new Date(r.createdAt).toLocaleDateString("ko-KR")}</td>
                    <td>{r.writerName || "-"}</td>
                    <td style={{ fontWeight: "bold" }}>{r.title || "-"}</td>
                    <td style={{ textAlign: "left" }}>{r.content}</td>
                    <td>
                      {/* 배지 색상 구분: 완료/반려는 정상(녹색 계열), 나머지는 경고(붉은 계열) */}
                      <span
                        className={`status-badge ${r.status === "완료" || r.status === "반려" ? "status-normal" : "status-stopped"}`}
                      >
                        {r.status === "PENDING" ? "접수" : r.status}
                      </span>
                    </td>
                    <td>
                      {r.status === "완료" || r.status === "반려" ? (
                        <span style={{ color: "#999", fontSize: "12px" }}>처리 완료</span>
                      ) : (
                        <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                          <button
                            className="admin-action-btn"
                            style={{ backgroundColor: "#faad14", color: "white" }}
                            onClick={() => handleReportAction(r.id, "처리중")}
                          >
                            처리중
                          </button>

                          <button
                            className="admin-action-btn"
                            style={{ backgroundColor: "#ff4d4f", color: "white" }}
                            onClick={() => handleReportAction(r.id, "완료")}
                          >
                            완료
                          </button>

                          <button
                            className="admin-action-btn"
                            style={{ backgroundColor: "#bfbfbf", color: "white" }}
                            onClick={() => handleReportAction(r.id, "반려")}
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
