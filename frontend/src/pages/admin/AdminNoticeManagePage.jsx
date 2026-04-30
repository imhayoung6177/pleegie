import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminCommon.css";

const AdminNoticeManagePage = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTarget, setNewTarget] = useState("ALL");
  const [editingId, setEditingId] = useState(null);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  // 공지 목록 조회
  const fetchNotices = async () => {
    try {
      const response = await axios.get("/admin/notices", { headers: getHeaders() });
      setNotices(response.data.data || []);
    } catch (error) {
      console.error("공지 목록 로딩 실패:", error);
    }
  };

  useEffect(() => {
  const load = async () => {
    await fetchNotices();
  };
  load();
}, []);

  // 공지 저장/수정
  const handleSave = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert("제목과 내용을 모두 입력해주세요!");
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `/admin/notices/${editingId}`,
          { title: newTitle, content: newContent, targetType: newTarget },
          { headers: getHeaders() }
        );
        alert("수정되었습니다.");
      } else {
        await axios.post(
          "/admin/notices",
          { title: newTitle, content: newContent, targetType: newTarget },
          { headers: getHeaders() }
        );
        alert("등록되었습니다.");
      }
      await fetchNotices();
      closeFormModal();
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 공지 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("이 공지사항을 정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/admin/notices/${id}`, { headers: getHeaders() });
      setNotices(prev => prev.filter(n => n.id !== id));
      alert("삭제되었습니다.");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const closeFormModal = () => {
    setNewTitle(""); setNewContent(""); setNewTarget("ALL");
    setEditingId(null); setIsModalOpen(false);
  };

  const handleEditClick = (notice) => {
    setEditingId(notice.id);
    setNewTitle(notice.title);
    setNewContent(notice.content);
    setNewTarget(notice.targetType);
    setIsModalOpen(true);
  };

  // targetType 한글 변환
  const targetLabel = (type) => {
    if (type === "ALL") return "전체";
    if (type === "USER") return "일반";
    if (type === "MARKET") return "사업자";
    return type;
  };

  return (
    <div className="admin-login-container dashboard-mode">
      <nav className="admin-topnav">
        <div className="admin-topnav-left">
          <h1 className="admin-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>pleegie</h1>
        </div>
        <div className="admin-topnav-right">
          <span className="admin-user-info">👤 관리자님</span>
          <button className="admin-btn-logout" onClick={() => navigate("/admin/dashboard")}>뒤로가기</button>
        </div>
      </nav>

      <div className="admin-board">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="admin-title" style={{ marginBottom: 0 }}>📢 공지사항 관리 모드</h2>
          <button
            className="admin-action-btn"
            style={{ backgroundColor: "#28a745", color: "white", padding: "10px 20px" }}
            onClick={() => { setEditingId(null); setNewTitle(""); setNewContent(""); setNewTarget("ALL"); setIsModalOpen(true); }}
          >
            + 새 공지 작성
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>공지 대상</th>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {notices.length > 0 ? notices.map((n) => (
                <tr key={n.id}>
                  <td>{n.id}</td>
                  <td>
                    <span className={`status-badge ${n.targetType === "ALL" ? "status-normal" : "status-pending"}`}>
                      {targetLabel(n.targetType)}
                    </span>
                  </td>
                  <td
                    style={{ textAlign: "left", fontWeight: "600", cursor: "pointer", color: "#1890ff" }}
                    onClick={() => { setSelectedNotice(n); setViewModalOpen(true); }}
                  >
                    {n.title}
                  </td>
                  <td>{n.adminName}</td>
                  <td>{new Date(n.createdAt).toLocaleDateString('ko-KR')}</td>
                  <td>
                    <button className="admin-action-btn"
                      style={{ backgroundColor: "#4a90e2", color: "white" }}
                      onClick={() => handleEditClick(n)}>수정</button>
                    <button className="admin-action-btn"
                      style={{ backgroundColor: "#ff4d4f", color: "white" }}
                      onClick={() => handleDelete(n.id)}>삭제</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", color: "#999" }}>등록된 공지사항이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 작성/수정 모달 */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" style={{ width: "550px" }}>
            <h3 style={{ marginBottom: "20px" }}>{editingId ? "✏️ 공지사항 수정" : "📝 새 공지사항 작성"}</h3>
            <div style={{ textAlign: "left", marginBottom: "15px" }}>
              <label className="admin-label">공지 제목</label>
              <input className="admin-input" value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)} placeholder="제목을 입력하세요" />
            </div>
            <div style={{ textAlign: "left", marginBottom: "15px" }}>
              <label className="admin-label">공지 내용</label>
              <textarea className="admin-input"
                style={{ height: "150px", resize: "none", paddingTop: "15px" }}
                value={newContent} onChange={(e) => setNewContent(e.target.value)}
                placeholder="공지 상세 내용을 입력하세요" />
            </div>
            <div style={{ textAlign: "left", marginBottom: "20px" }}>
              <label className="admin-label">공지 대상</label>
              <select className="admin-input" value={newTarget} onChange={(e) => setNewTarget(e.target.value)}>
                <option value="ALL">전체</option>
                <option value="USER">일반</option>
                <option value="MARKET">사업자</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="admin-action-btn"
                style={{ backgroundColor: "#1890ff", color: "white", flex: 1 }}
                onClick={handleSave}>{editingId ? "수정완료" : "등록"}</button>
              <button className="admin-action-btn"
                style={{ backgroundColor: "#bfbfbf", color: "white", flex: 1 }}
                onClick={closeFormModal}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 상세보기 모달 */}
      {viewModalOpen && selectedNotice && (
        <div className="admin-modal-overlay" onClick={() => setViewModalOpen(false)}>
          <div className="admin-modal-content" style={{ width: "500px", textAlign: "left" }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: "#ff6b35", marginBottom: "10px" }}>{selectedNotice.title}</h2>
            <div style={{ fontSize: "14px", color: "#888", marginBottom: "15px",
              borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
              대상: {targetLabel(selectedNotice.targetType)} | 작성자: {selectedNotice.adminName} | 
              작성일: {new Date(selectedNotice.createdAt).toLocaleDateString('ko-KR')}
            </div>
            <div style={{ minHeight: "150px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
              {selectedNotice.content}
            </div>
            <button className="admin-action-btn"
              style={{ backgroundColor: "#ff6b35", color: "white", width: "100%", marginTop: "20px", height: "45px" }}
              onClick={() => setViewModalOpen(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNoticeManagePage;