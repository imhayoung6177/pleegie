import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCommon.css"; // 🎨 공통 디자인 설계도 연결

const AdminMarketManagePage = () => {
  const navigate = useNavigate();

  // 📦 [데이터 바구니] 소상공인 신청 및 등록 목록 (가짜 데이터)
  // 나중에 백엔드 API를 연결하면 이 부분이 서버 데이터로 채워집니다.
  const [markets, setMarkets] = useState([
    { id: 101, name: "남대문 과일나라", businessNo: "123-45-67890", date: "2026-04-22", status: "대기" },
    { id: 102, name: "광장시장 빈대떡", businessNo: "987-65-43210", date: "2026-04-23", status: "대기" },
    { id: 103, name: "준호네 채소", businessNo: "555-00-11111", date: "2026-04-24", status: "승인" },
  ]);

  // 📮 [비유: 통지서 발송] 처리 결과를 사용자에게 알림으로 보여주는 함수
  const sendNotification = (name, status, reason = "") => {
    const message = reason
      ? `[알림] ${name}님, 신청이 반려되었습니다. 사유: ${reason}`
      : `[알림] ${name}님, 신청이 ${status}되었습니다!`;

    // 실제 서비스라면 여기서 메일이나 알림톡 API를 호출합니다.
    alert(`📢 처리 결과 알림이 발송되었습니다:\n${message}`);
  };

  // ✅ 1. [승인] 버튼 클릭 시 로직
  const handleApprove = (id, name) => {
    if (window.confirm(`${name} 입점을 승인하시겠습니까?`)) {
      // 목록에서 해당 아이디를 찾아 상태를 '승인'으로 변경
      setMarkets(markets.map((m) => (m.id === id ? { ...m, status: "승인" } : m)));
      sendNotification(name, "승인");
    }
  };

  // ❌ 2. [반려] 버튼 클릭 시 로직
  const handleReject = (id, name) => {
    const reason = prompt("반려 사유를 입력해주세요:");
    if (reason) {
      // 목록에서 해당 아이디를 찾아 상태를 '반려'로 변경
      setMarkets(markets.map((m) => (m.id === id ? { ...m, status: "반려" } : m)));
      sendNotification(name, "반려", reason);
    }
  };

  // ⛔ 3. [영업 정지] 버튼 클릭 시 로직
  const handleSuspend = (id, name) => {
    if (window.confirm(`${name}의 영업을 정지시키겠습니까?`)) {
      setMarkets(markets.map((m) => (m.id === id ? { ...m, status: "정지" } : m)));
      sendNotification(name, "영업 정지");
    }
  };

  return (
    // dashboard-mode 클래스로 회원 관리와 똑같은 배경 이미지를 적용합니다.
    <div className="admin-login-container dashboard-mode">
      {/* 🚀 1. 상단 네비게이션 바 */}
      <nav className="admin-topnav">
        <div className="admin-topnav-left">
          {/* 로고 클릭 시 메인으로 이동 */}
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

      {/* 📋 2. 메인 화이트 보드 (반투명 상자) */}
      <div className="admin-board">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="admin-title" style={{ marginBottom: 0 }}>
            🏪 사업자 관리 모드
          </h2>
          <p style={{ color: "#888", fontSize: "14px" }}>소상공인 입점 신청 목록을 확인하고 처리합니다.</p>
        </div>

        {/* 3. 테이블 영역 (Table Area) */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>시장/가게명</th>
                <th>사업자번호</th>
                <th>신청일</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((m) => (
                <tr key={m.id}>
                  {/* 상호명은 강조(Bold) 처리 */}
                  <td style={{ fontWeight: "bold" }}>{m.name}</td>
                  <td>{m.businessNo}</td>
                  <td>{m.date}</td>
                  <td>
                    {/* 상태(승인/대기/정지)에 따라 이름표 색상을 다르게 표시합니다 */}
                    <span
                      className={`status-badge ${
                        m.status === "승인"
                          ? "status-normal"
                          : m.status === "대기"
                            ? "status-pending"
                            : "status-stopped"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td>
                    {/* 🛠️ 상태에 따른 버튼 조건부 렌더링 (비유: 상황에 맞는 도구 꺼내기) */}
                    {m.status === "대기" ? (
                      <>
                        <button
                          className="admin-action-btn"
                          style={{ backgroundColor: "#4a90e2", color: "white" }}
                          onClick={() => handleApprove(m.id, m.name)}
                        >
                          승인
                        </button>
                        <button
                          className="admin-action-btn"
                          style={{ backgroundColor: "#ff4d4f", color: "white" }}
                          onClick={() => handleReject(m.id, m.name)}
                        >
                          반려
                        </button>
                      </>
                    ) : m.status === "승인" ? (
                      <button
                        className="admin-action-btn"
                        style={{ backgroundColor: "#722ed1", color: "white" }}
                        onClick={() => handleSuspend(m.id, m.name)}
                      >
                        영업 정지
                      </button>
                    ) : (
                      // 이미 반려되거나 정지된 데이터는 추가 조작 불가
                      <span style={{ color: "#999", fontSize: "12px" }}>처리 완료 ({m.status})</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMarketManagePage;
