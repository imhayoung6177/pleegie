import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminCommon.css"; // 디자인 설계도 연결

const AdminUserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]); // [비유: 장부 데이터 저장 공간]

  // 화면이 처음 켜질 때 실행되는 '마법의 상자' (useEffect)
  useEffect(() => {
    // 서버에서 데이터를 가져오는 함수를 안으로 이사 시켰습니다.
    const fetchUsers = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get("http://localhost:8080/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // 서버에서 받은 데이터를 장부(users)에 저장 (상태 업데이트)
        setUsers(response.data.data || []);
      } catch (error) {
        console.error("회원 목록 로딩 실패:", error);
      }
    };

    fetchUsers(); // 화면이 나타나자마자 실행!
  }, []); // [] : 처음에 딱 한 번만 실행하고 더 이상 참견하지 말라는 뜻

  // [PATCH: 부분 수정] 회원 상태 변경 함수
  const handleStatusChange = async (userId, currentStatus) => {
    const token = localStorage.getItem("accessToken");
    // ACTIVE면 STOPPED로, 아니면 ACTIVE로 글자만 바꿉니다.
    const newStatus = currentStatus === "ACTIVE" ? "STOPPED" : "ACTIVE";

    if (!window.confirm(`회원 상태를 ${newStatus}로 변경하시겠습니까?`)) return;

    try {
      await axios.put(
        `http://localhost:8080/api/admin/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("상태가 성공적으로 변경되었습니다.");

      // 상태 변경 후, 다시 데이터를 가져와 화면을 갱신합니다.
      window.location.reload();
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("변경 중 오류가 발생했습니다.");
    }
  };

  // [DELETE: 삭제] 회원 강제 탈퇴 함수
  const handleUserDelete = async (userId, userName) => {
    const token = localStorage.getItem("accessToken");

    if (!window.confirm(`${userName} 회원을 강제로 탈퇴시키겠습니까?`)) return;

    try {
      // 서버에서 해당 ID의 회원 정보를 삭제 요청합니다.
      await axios.delete(`http://localhost:8080/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("탈퇴 처리가 완료되었습니다.");
      window.location.reload(); // 화면 갱신
    } catch (error) {
      console.error("탈퇴 실패:", error);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="admin-login-container dashboard-mode">
      {/*  상단 네비게이션 바 */}
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

      {/* 메인 화이트 보드 영역 */}
      <div className="admin-board">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="admin-title" style={{ marginBottom: 0 }}>
            👥 회원 관리 모드
          </h2>
          <p style={{ color: "#888", fontSize: "14px" }}>전체 회원 목록을 확인하고 상태를 관리합니다.</p>
        </div>

        {/* 테이블 영역 (Table Area) */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>이메일</th>
                <th>역할</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td style={{ fontWeight: "bold" }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {/* 상태값(ACTIVE/STOPPED)에 따라 다른 색상의 배지를 보여줍니다 */}
                    <span className={`status-badge ${user.status === "ACTIVE" ? "status-normal" : "status-stopped"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {/* 버튼 클릭 시 위에서 만든 함수들을 호출합니다 */}
                    <button
                      className="admin-action-btn"
                      style={{ backgroundColor: "#4a90e2", color: "white" }}
                      onClick={() => handleStatusChange(user.id, user.status)}
                    >
                      상태 변경
                    </button>
                    <button
                      className="admin-action-btn"
                      style={{ backgroundColor: "#ff4d4f", color: "white" }}
                      onClick={() => handleUserDelete(user.id, user.name)}
                    >
                      강제 탈퇴
                    </button>
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

export default AdminUserManagementPage;
