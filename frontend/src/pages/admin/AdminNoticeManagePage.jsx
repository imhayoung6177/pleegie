import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminNoticeManagePage = () => {
  const navigate = useNavigate();

  // 1. [데이터 바구니] 공지 목록 (State)
  const [notices, setNotices] = useState([
    { id: 1, title: "서비스 점검 안내", target: "전체", date: "2026-04-30" },
    { id: 2, title: "전통시장 장바구니 증정 이벤트", target: "일반", date: "2026-04-24" },
  ]);

  // 🚀 2. [모달 및 입력값 상태 관리]
  // 직접 입력 대신 화면에 띄울 '입력 창'의 상태들을 관리합니다.
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달창 열림/닫힘 상태
  const [newTitle, setNewTitle] = useState(""); // 새로 쓸 제목
  const [newTarget, setNewTarget] = useState("전체"); // 선택된 대상 (기본값: 전체)

  // 3. [공지 저장 함수] 등록 버튼을 눌렀을 때 실행됩니다.
  const handleSave = () => {
    // 제목이 비어있는지 확인하는 안전장치 (Validation)
    if (!newTitle.trim()) {
      alert("📢 공지 제목을 입력해주세요!");
      return;
    }

    // 새로운 공지 객체 생성
    const newNotice = {
      id: notices.length + 1,
      title: newTitle,
      target: newTarget, // 드롭다운에서 선택된 값이 들어갑니다.
      date: new Date().toLocaleDateString(),
    };

    // 기존 목록 맨 앞에 추가
    setNotices([newNotice, ...notices]);

    // 입력창 초기화 및 닫기
    setNewTitle("");
    setNewTarget("전체");
    setIsModalOpen(false);
    alert(`✅ [${newTarget}] 대상으로 공지가 등록되었습니다.`);
  };

  // 4. [공지 삭제 함수]
  const handleDelete = (id) => {
    if (window.confirm("이 공지사항을 정말 삭제하시겠습니까?")) {
      setNotices(notices.filter((n) => n.id !== id));
      alert("삭제되었습니다.");
    }
  };

  return (
    <div style={{ padding: "30px", position: "relative" }}>
      {/* 헤더 영역 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>📢 공지사항 관리 (Notice Management)</h2>
        <button onClick={() => navigate("/admin/dashboard")} style={backBtnStyle}>
          뒤로가기
        </button>
      </div>

      <p>서비스 사용자들에게 전달할 공지사항을 작성하고 관리합니다.</p>

      {/* 작성 버튼: 클릭 시 모달창을 띄웁니다. */}
      <div style={{ marginBottom: "20px" }}>
        <button style={createBtnStyle} onClick={() => setIsModalOpen(true)}>
          + 새 공지 작성
        </button>
      </div>

      {/* 🚀 5. 새 공지 작성 모달 (Modal) */}
      {/* isModalOpen이 true일 때만 화면에 나타납니다 (조건부 렌더링) */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginBottom: "20px" }}>📝 새 공지사항 작성</h3>

            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <label style={labelStyle}>공지 제목</label>
              <input
                style={inputStyle}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="제목을 입력하세요"
              />
            </div>

            <div style={{ marginBottom: "25px", textAlign: "left" }}>
              <label style={labelStyle}>공지 대상 (선택)</label>
              {/* 🖱️ 드롭다운: 이제 직접 타이핑할 필요가 없습니다! */}
              <select style={inputStyle} value={newTarget} onChange={(e) => setNewTarget(e.target.value)}>
                <option value="전체">전체 (All)</option>
                <option value="일반">일반 사용자 (User)</option>
                <option value="사업자">사업자 (Market)</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSave} style={{ ...createBtnStyle, flex: 1 }}>
                등록
              </button>
              <button onClick={() => setIsModalOpen(false)} style={{ ...delBtnStyle, flex: 1 }}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

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

/* ── 스타일 인테리어 (CSS-in-JS) ── */

// 🌑 모달 뒷배경 (어둡게 처리)
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

// ⚪ 모달 상자
const modalContentStyle = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "12px",
  width: "400px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  textAlign: "center",
};

const labelStyle = { display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" };

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  boxSizing: "border-box",
  fontSize: "14px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  backgroundColor: "#fff",
};
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

const targetBadgeStyle = (target) => ({
  padding: "3px 10px",
  borderRadius: "15px",
  fontSize: "12px",
  fontWeight: "bold",
  backgroundColor: target === "전체" ? "#e6f7ff" : target === "사업자" ? "#fff7e6" : "#f6ffed",
  color: target === "전체" ? "#1890ff" : target === "사업자" ? "#fa8c16" : "#52c41a",
  border: "1px solid",
});

export default AdminNoticeManagePage;
