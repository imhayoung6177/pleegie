import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminUserManagePage = () => {
  const navigate = useNavigate();

  // 1. 회원 데이터를 담을 바구니 (State)
  // 지금은 테스트용 가짜 데이터(Mock Data)를 넣어둡니다.
  const [users, setUsers] = useState([
    { id: 1, name: "황준호", email: "juno@test.com", role: "ADMIN", status: "정상" },
    { id: 2, name: "이종빈", email: "bin@test.com", role: "USER", status: "정상" },
    { id: 3, name: "심술궂은유저", email: "bad@test.com", role: "USER", status: "정지" },
  ]);

  // 2. [명세서: PUT /admin/users/{id}/status] 상태 변경 기능
  const handleStatusChange = (id) => {
    setUsers(
      users.map((user) => {
        if (user.id === id) {
          const nextStatus = user.status === "정상" ? "정지" : "정상";
          alert(`회원번호 ${id}번의 상태를 ${nextStatus}(으)로 변경합니다.`);
          return { ...user, status: nextStatus };
        }
        return user;
      }),
    );
  };

  // 3. [명세서: DELETE /admin/users/{id}] 강제 탈퇴 기능
  const handleKickOut = (id) => {
    if (window.confirm(`회원번호 ${id}번을 정말 강제 탈퇴시키겠습니까?`)) {
      setUsers(users.filter((user) => user.id !== id));
      alert("탈퇴 처리가 완료되었습니다.");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      {/* 상단 헤더 영역 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>👥 회원 관리 모드</h2>
        <button onClick={() => navigate("/admin/dashboard")} style={backBtnStyle}>
          뒤로가기
        </button>
      </div>

      <p>전체 회원 목록을 확인하고 권한 및 상태를 관리합니다.</p>

      {/* 회원 목록 장부 (Table) */}
      <table style={tableStyle}>
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>이름</th>
            <th style={thStyle}>이메일</th>
            <th style={thStyle}>역할</th>
            <th style={thStyle}>상태</th>
            <th style={thStyle}>관리</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ textAlign: "center" }}>
              <td style={tdStyle}>{user.id}</td>
              <td style={tdStyle}>{user.name}</td>
              <td style={tdStyle}>{user.email}</td>
              <td style={tdStyle}>{user.role}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    color: user.status === "정상" ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {user.status}
                </span>
              </td>
              <td style={tdStyle}>
                <button style={actionBtnStyle} onClick={() => handleStatusChange(user.id)}>
                  상태 변경
                </button>
                <button
                  style={{ ...actionBtnStyle, backgroundColor: "#ff4d4f" }}
                  onClick={() => handleKickOut(user.id)}
                >
                  강제 탈퇴
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ── 스타일 코드 ── */
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};
const thStyle = { borderBottom: "2px solid #eee", padding: "12px", color: "#666" };
const tdStyle = { borderBottom: "1px solid #eee", padding: "12px" };
const backBtnStyle = { padding: "8px 16px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "4px" };
const actionBtnStyle = {
  marginRight: "5px",
  padding: "5px 10px",
  fontSize: "12px",
  cursor: "pointer",
  backgroundColor: "#1890ff",
  color: "#fff",
  border: "none",
  borderRadius: "3px",
};

export default AdminUserManagePage;
