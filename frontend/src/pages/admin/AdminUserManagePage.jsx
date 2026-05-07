import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminCommon.css"; // 디자인 설계도 연결

const AdminUserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]); // [비유: 장부 데이터 저장 공간]

  // 🚀 [에러 해결] fetchUsers 함수를 useEffect 안으로 이동시켜 관리를 일원화했습니다.
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // 서버에서 받은 데이터를 장부에 저장
        setUsers(response.data.data || []);
      } catch (error) {
        console.error("회원 목록 로딩 실패:", error);
      }
    };

    fetchUsers(); // 화면이 나타나자마자 실행!
  }, []); // [] : 처음에 딱 한 번만 실행 (cascading render 에러 방지)

  // ✏️ 2. [PATCH: 부분 수정] 회원 상태 변경 함수 (정상 <-> 정지)
  const handleStatusChange = async (userId, currentStatus) => {
    if (currentStatus === "DELETED") {
      alert("❌ 이미 탈퇴된 회원은 상태를 변경할 수 없습니다.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    // 백엔드 AdminService 약속(SUSPENDED)에 맞춰 설정
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    if (!window.confirm(`회원 상태를 ${newStatus === "ACTIVE" ? "정상" : "정지"}로 변경하시겠습니까?`)) return;

    try {
      await axios.put(
        `/admin/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // [깜빡임 방지] 장부에서 해당 유저의 정보만 업데이트
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)));
      alert("✅ 상태가 성공적으로 변경되었습니다.");
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("변경 중 오류가 발생했습니다.");
    }
  };

  // 🗑️ 3. [DELETE 처럼 작동하는 PUT] 회원 강제 탈퇴 함수
  const handleUserDelete = async (userId, userName, currentStatus) => {
    // 🚀 [안전 장치] 이미 탈퇴된 상태인지 먼저 확인합니다.
    if (currentStatus === "DELETED") {
      alert("❌ 이미 탈퇴 처리된 회원입니다.");
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!window.confirm(`${userName} 회원을 강제로 탈퇴시키겠습니까?`)) return;

    try {
      // 서버의 상태 변경 창구(PUT)를 이용해 "DELETED"로 업데이트 요청
      await axios.put(
        `http://localhost:8080/api/admin/users/${userId}/status`,
        { status: "DELETED" },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // [깜빡임 방지] 화면 목록에서 삭제된 유저를 즉시 제거
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

      alert(`🗑️ ${userName} 회원의 강제 탈퇴 처리가 완료되었습니다.`);
    } catch (error) {
      console.error("탈퇴 처리 실패:", error);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="admin-login-container dashboard-mode">
      {/* 🚀 상단 네비게이션 바 */}
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

      {/* 📋 메인 화이트 보드 영역 */}
      <div className="admin-board">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="admin-title" style={{ marginBottom: 0 }}>
            👥 회원 관리 모드
          </h2>
          <p style={{ color: "#888", fontSize: "14px" }}>전체 회원 목록을 확인하고 상태를 관리합니다.</p>
        </div>

        {/* 📊 테이블 영역 */}
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
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {/* 상태값(ACTIVE/SUSPENDED/DELETED)에 따라 다른 색상의 배지 표시 */}
                    <span className={`status-badge ${user.status === "ACTIVE" ? "status-normal" : "status-stopped"}`}>
                      {user.status === "ACTIVE" ? "정상" : user.status === "SUSPENDED" ? "정지" : "탈퇴"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="admin-action-btn"
                      style={{
                        backgroundColor: user.status === "DELETED" ? "#ccc" : "#4a90e2",
                        color: "white",
                        cursor: user.status === "DELETED" ? "not-allowed" : "pointer",
                      }}
                      onClick={() => handleStatusChange(user.id, user.status)}
                      disabled={user.status === "DELETED"}
                    >
                      상태 변경
                    </button>
                    <button
                      className="admin-action-btn"
                      style={{
                        backgroundColor: user.status === "DELETED" ? "#ccc" : "#ff4d4f",
                        color: "white",
                        cursor: user.status === "DELETED" ? "not-allowed" : "pointer",
                        marginLeft: "5px",
                      }}
                      // 🚀 currentStatus를 세 번째 인자로 전달합니다.
                      onClick={() => handleUserDelete(user.id, user.name, user.status)}
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
