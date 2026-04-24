import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminMarketManagePage = () => {
  const navigate = useNavigate();

  // [데이터 바구니] 신청 목록 (State)
  // 나중에 백엔드 API와 연결할 가짜 데이터입니다.
  const [markets, setMarkets] = useState([
    { id: 101, name: "남대문 과일나라", businessNo: "123-45-67890", date: "2026-04-22", status: "대기" },
    { id: 102, name: "광장시장 빈대떡", businessNo: "987-65-43210", date: "2026-04-23", status: "대기" },
    { id: 103, name: "준호네 채소", businessNo: "555-00-11111", date: "2026-04-24", status: "승인" },
  ]);

  // [알림 발송 로직] - 비유: 우체국에서 통지서 발송하기
  const sendNotification = (name, status, reason = "") => {
    const message = reason
      ? `[알림] ${name}님, 신청이 반려되었습니다. 사유: ${reason}`
      : `[알림] ${name}님, 신청이 ${status}되었습니다!`;

    // 실제로는 여기서 카카오톡 알림톡이나 메일 API를 호출하게 됩니다.
    console.log(`메시지 전송: ${message}`);
    alert(`📢 처리 결과 알림이 발송되었습니다:\n${message}`);
  };

  // 1. [승인] 처리
  const handleApprove = (id, name) => {
    if (window.confirm(`${name} 입점을 승인하시겠습니까?`)) {
      setMarkets(markets.map((m) => (m.id === id ? { ...m, status: "승인" } : m)));
      sendNotification(name, "승인"); // 플로우차트 마지막 단계: 알림 발송
    }
  };

  // 2. [반려] 처리
  const handleReject = (id, name) => {
    const reason = prompt("반려 사유를 입력해주세요:");
    if (reason) {
      setMarkets(markets.map((m) => (m.id === id ? { ...m, status: "반려" } : m)));
      sendNotification(name, "반려", reason); // 플로우차트 마지막 단계: 알림 발송
    }
  };

  // 3. [정지] 처리 - 플로우차트 오른쪽 '정지' 로직 추가
  const handleSuspend = (id, name) => {
    if (window.confirm(`${name}의 영업을 정지시키겠습니까?`)) {
      setMarkets(markets.map((m) => (m.id === id ? { ...m, status: "정지" } : m)));
      sendNotification(name, "영업 정지");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>🏪 사업자 관리 (Market Management)</h2>
        <button onClick={() => navigate("/admin/dashboard")} style={backBtnStyle}>
          뒤로가기
        </button>
      </div>
      <p>소상공인 입점 신청 목록을 확인하고 승인/반려를 처리합니다.</p>

      <table style={tableStyle}>
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa" }}>
            <th style={thStyle}>시장/가게명</th>
            <th style={thStyle}>사업자번호</th>
            <th style={thStyle}>신청일</th>
            <th style={thStyle}>상태</th>
            <th style={thStyle}>관리</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((m) => (
            <tr key={m.id} style={{ textAlign: "center" }}>
              <td style={tdStyle}>{m.name}</td>
              <td style={tdStyle}>{m.businessNo}</td>
              <td style={tdStyle}>{m.date}</td>
              <td style={tdStyle}>
                <b style={{ color: m.status === "승인" ? "blue" : m.status === "반려" ? "red" : "orange" }}>
                  {m.status}
                </b>
              </td>
              <td style={tdStyle}>
                {/* 1. 신청 중(대기)인 경우: 승인/반려 버튼 */}
                {m.status === "대기" ? (
                  <>
                    <button style={approveBtnStyle} onClick={() => handleApprove(m.id, m.name)}>
                      승인
                    </button>
                    <button style={rejectBtnStyle} onClick={() => handleReject(m.id, m.name)}>
                      반려
                    </button>
                  </>
                ) : m.status === "승인" ? (
                  /* 2. 이미 승인된 경우: 영업 정지 버튼 노출 - 황준호 추가 로직 */
                  <button style={suspendBtnStyle} onClick={() => handleSuspend(m.id, m.name)}>
                    영업 정지
                  </button>
                ) : (
                  /* 3. 반려 또는 정지된 경우: 처리 완료 표시 */
                  <span style={{ color: "#999" }}>완료됨 ({m.status})</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ── 스타일 코드 ── */
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "20px" };
const thStyle = { borderBottom: "2px solid #eee", padding: "12px", color: "#666" };
const tdStyle = { borderBottom: "1px solid #eee", padding: "12px" };
const backBtnStyle = { padding: "8px 16px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc" };
const approveBtnStyle = {
  marginRight: "5px",
  padding: "5px 10px",
  backgroundColor: "#1890ff",
  color: "#fff",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
};
const rejectBtnStyle = {
  padding: "5px 10px",
  backgroundColor: "#ff4d4f",
  color: "#fff",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
};
const suspendBtnStyle = {
  padding: "5px 10px",
  backgroundColor: "#722ed1", // 보라색: 정지의 느낌!
  color: "#fff",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
};

export default AdminMarketManagePage;
