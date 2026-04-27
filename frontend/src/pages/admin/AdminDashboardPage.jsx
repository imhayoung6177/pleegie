import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ navigate를 쓰기 위해 추가
import axios from "axios";

const AdminDashboardPage = () => {
  const navigate = useNavigate(); // ✅ navigate 함수 정의
  const [adminName, setAdminName] = useState(""); // ✅ 화면에서 쓸 이름을 위해 setAdminName으로 수정

  useEffect(() => {
    const fetchData = async () => {
      // 1. 금고(localStorage)에서 아까 저장한 열쇠를 꺼냅니다.
      const token = localStorage.getItem("accessToken");

      try {
        // 2. 서버에 요청할 때 'Authorization' 주머니에 열쇠를 넣어서 보냅니다.
        // 📡 백엔드 AdminController에 /api/admin/dashboard-info 같은 엔드포인트가 있다고 가정합니다.
        const response = await axios.get("http://localhost:8080/api/admin/users", {
          // 예시로 유저 목록 주소 사용
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 성공 시 받아온 데이터 중 이름을 상태에 저장 (구조는 백엔드 응답에 맞춰 조절)
        // 만약 단순 유저 목록이라면 "관리자"라고 기본값을 넣어줄 수도 있습니다.
        setAdminName("관리자");
      } catch (error) {
        console.error("인증 실패:", error);
        // 토큰이 없거나 만료된 경우, 알림 없이 조용히 로그인 페이지로 보냅니다.
        localStorage.clear();
        navigate("/admin/login", { replace: true });
      }
    };

    fetchData();

    // --- 뒤로 가기 방지 로직 ---
    // 현재 위치를 역사(History)에 고정시킵니다.
    window.history.pushState(null, null, window.location.href);

    const handlePreventBack = () => {
      // 사용자가 뒤로 가기를 누르면 다시 현재 위치로 밀어넣어 제자리에 둡니다.
      window.history.pushState(null, null, window.location.href);
      alert("로그인 상태에서는 메인으로 돌아갈 수 없습니다. 로그아웃을 이용해주세요!");
    };

    // 브라우저의 '뒤로 가기' 감지 장치를 켭니다.
    window.addEventListener("popstate", handlePreventBack);

    // [가장 중요] 리액트의 '청소(Cleanup)' 기능!
    // 로그아웃을 하거나 페이지를 떠날 때(Unmount), 위에서 켰던 감지 장치를 확실히 끕니다.
    return () => {
      window.removeEventListener("popstate", handlePreventBack);
    };
  }, [navigate]);

  // 🚀 로그아웃 함수 정의
  const handleLogout = () => {
    localStorage.clear();
    alert("안전하게 로그아웃 되었습니다.");
    window.location.replace("/admin/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* 상단 헤더 영역 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        {/* ✅ adminName이 비어있으면 "관리자"라고 표시 */}
        <h1 style={{ margin: 0 }}>📊 {adminName || "관리자"}님, 환영합니다!</h1>
        <button onClick={handleLogout} style={logoutBtnStyle}>
          🚪 로그아웃 (Logout)
        </button>
      </div>

      <div style={gridContainerStyle}>
        <div style={btnStyle} onClick={() => navigate("/admin/users")}>
          👥 회원 관리
        </div>
        <div style={btnStyle} onClick={() => navigate("/admin/markets")}>
          🏪 사업자 관리
        </div>
        <div style={btnStyle} onClick={() => navigate("/admin/reports")}>
          🚩 신고 관리
        </div>
        <div style={btnStyle} onClick={() => navigate("/admin/notices")}>
          📢 공지 관리
        </div>
        <div
          style={{ ...btnStyle, gridColumn: "span 2", backgroundColor: "#f0f7ff" }}
          onClick={() => navigate("/admin/statistics")}
        >
          📈 통계 조회 (Statistics)
        </div>
      </div>
    </div>
  );
};

// --- 스타일 정의 부분 ---
const gridContainerStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" };
const btnStyle = {
  border: "1px solid #ddd",
  padding: "20px",
  borderRadius: "8px",
  cursor: "pointer",
  textAlign: "center",
  fontSize: "18px",
  fontWeight: "bold",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};
const logoutBtnStyle = {
  padding: "10px 15px",
  backgroundColor: "#ff4d4f",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};

export default AdminDashboardPage;
