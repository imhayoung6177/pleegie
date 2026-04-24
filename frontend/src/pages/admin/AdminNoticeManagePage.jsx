import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminNoticeManagePage = () => {
  const navigate = useNavigate();

  // 1. [데이터 바구니] 공지 목록 (State)
  // 명세서: GET /admin/notices 연동을 대비한 데이터 구조입니다.
  const [notices, setNotices] = useState([
    { id: 1, title: "서비스 점검 안내", target: "전체", date: "2026-04-30" },
    { id: 2, title: "전통시장 장바구니 증정 이벤트", target: "일반", date: "2026-04-24" },
  ]);

  // 2. [명세서: POST /admin/notices] 새 공지 작성 함수
  // 플로우차트의 [공지 작성 -> 공지 대상 선택] 흐름을 구현합니다.
  const handleCreate = () => {
    // [단계 1] 제목 입력받기 (플로우차트: 공지 작성)
    const title = prompt("📢 공지 제목을 입력하세요:");
    if (!title) return; // 제목을 입력하지 않거나 취소를 누르면 중단합니다.

    // [단계 2] 대상 입력받기 (플로우차트: 공지 대상 분기)
    const target = prompt("👥 공지 대상을 입력하세요\n(전체 / 일반 / 사업자)", "전체");

    // [단계 3] 유효성 검사 (설계 원칙에 따른 안전장치)
    const validTargets = ["전체", "일반", "사업자"];

    if (validTargets.includes(target)) {
      // 입력받은 정보로 새로운 공지 객체 만들기
      const newNotice = {
        id: notices.length + 1,
        title: title, // prompt에서 받은 제목
        target: target, // prompt에서 받은 대상 (배지 색상을 결정함)
        date: new Date().toLocaleDateString(), // 현재 날짜 자동 생성
      };

      // 기존 바구니의 맨 앞에 새 공지를 추가합니다.
      setNotices([newNotice, ...notices]);
      alert(`✅ [${target}] 대상으로 공지가 성공적으로 등록되었습니다.`);
    } else {
      // 엉뚱한 대상을 입력했을 경우 경고창을 띄웁니다.
      alert("❌ 잘못된 대상입니다.\n'전체, 일반, 사업자' 중에서만 입력해주세요.");
    }
  };

  // 3. [명세서: DELETE /admin/notices/{id}] 공지 삭제 함수
  const handleDelete = (id) => {
    if (window.confirm("이 공지사항을 정말 삭제하시겠습니까?")) {
      setNotices(notices.filter((n) => n.id !== id));
      alert("삭제되었습니다.");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      {/* 헤더 영역 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>📢 공지사항 관리 (Notice Management)</h2>
        <button onClick={() => navigate("/admin/dashboard")} style={backBtnStyle}>
          뒤로가기
        </button>
      </div>

      <p>서비스 사용자들에게 전달할 공지사항을 작성하고 관리합니다.</p>

      {/* 작성 버튼 영역 */}
      <div style={{ marginBottom: "20px" }}>
        <button style={createBtnStyle} onClick={handleCreate}>
          + 새 공지 작성
        </button>
      </div>

      {/* 공지 목록 테이블 */}
      <table style={tableStyle}>
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa" }}>
            <th style={thStyle}>번호</th>
            <th style={thStyle}>공지 대상</th>
            <th style={thStyle}>제목</th>
            <th style={thStyle}>작성일</th>
            <th style={thStyle}>관리</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((n) => (
            <tr key={n.id} style={{ textAlign: "center" }}>
              <td style={tdStyle}>{n.id}</td>
              <td style={tdStyle}>
                {/* 대상에 따라 색깔 배지를 그려줍니다. */}
                <span style={targetBadgeStyle(n.target)}>{n.target}</span>
              </td>
              <td style={{ ...tdStyle, textAlign: "left" }}>{n.title}</td>
              <td style={tdStyle}>{n.date}</td>
              <td style={tdStyle}>
                <button style={editBtnStyle}>수정</button>
                <button style={delBtnStyle} onClick={() => handleDelete(n.id)}>
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ── 스타일 인테리어 (가독성을 위한 디자인) ── */
const tableStyle = { width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" };
const thStyle = { borderBottom: "2px solid #eee", padding: "12px", backgroundColor: "#f4f4f4", color: "#666" };
const tdStyle = { borderBottom: "1px solid #eee", padding: "12px" };

const createBtnStyle = {
  padding: "10px 20px",
  backgroundColor: "#1890ff",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};
const editBtnStyle = {
  marginRight: "5px",
  padding: "5px 10px",
  backgroundColor: "#52c41a",
  color: "#fff",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
};
const delBtnStyle = {
  padding: "5px 10px",
  backgroundColor: "#ff4d4f",
  color: "#fff",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
};
const backBtnStyle = { padding: "8px 16px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "4px" };

// 플로우차트의 [공지 대상]을 시각화하는 도우미 함수
const targetBadgeStyle = (target) => ({
  padding: "3px 10px",
  borderRadius: "15px",
  fontSize: "12px",
  fontWeight: "bold",
  // 대상별로 배지 색상을 다르게 지정합니다.
  backgroundColor: target === "전체" ? "#e6f7ff" : target === "사업자" ? "#fff7e6" : "#f6ffed",
  color: target === "전체" ? "#1890ff" : target === "사업자" ? "#fa8c16" : "#52c41a",
  border: "1px solid",
});

export default AdminNoticeManagePage;
