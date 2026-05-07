// src/pages/user/ReportPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // ✅ fetch 대신 axios 사용 (프록시 정상 작동)
import '../../Styles/auth/AuthPage.css';
import '../../Styles/user/LocalCurrencyPage.css';

export default function ReportPage() {
  const navigate = useNavigate();

  // ── 폼 상태 관리 ──────────────────────────────────────
  // type: 신고 유형 | title: 제목 | content: 상세 내용
  const [form, setForm] = useState({
    type: '불친절/서비스 불만',
    title: '',
    content: ''
  });

  // ── 목록 / 로딩 / 모달 상태 ──────────────────────────
  const [reports, setReports]               = useState([]);   // 신고 내역 목록
  const [loading, setLoading]               = useState(true); // 로딩 중 여부
  const [selectedReport, setSelectedReport] = useState(null); // 모달에 표시할 신고

  // ── 토큰 헤더 생성 함수 ───────────────────────────────
  // localStorage에서 JWT 토큰을 꺼내 Authorization 헤더로 만들어줍니다.
  // axios는 POST/PUT 시 Content-Type: application/json을 자동으로 붙여줍니다.
  // DELETE는 body가 없으므로 Authorization만 보내는 것이 올바릅니다.
  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
  });

  // ── 신고 목록 불러오기 (GET /user/report) ─────────────
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/user/report', {
        headers: authHeader()
      });
      // axios 응답 구조: response.data = { success: true, message: "...", data: [...] }
      // data 없으면 빈 배열로 폴백
      setReports(response.data.data || []);
    } catch (err) {
      console.error("신고 내역 로딩 실패:", err);
    } finally {
      // 성공/실패 상관없이 로딩 종료
      setLoading(false);
    }
  };

  // 컴포넌트가 처음 화면에 나타날 때 목록 1회 조회
  useEffect(() => { fetchReports(); }, []);

  // ── 신고 접수 (POST /user/report) ────────────────────
  const handleSubmit = async (e) => {
    // form의 기본 제출 동작(페이지 새로고침) 방지
    e.preventDefault();

    // 빈 값 체크
    if (!form.title.trim() || !form.content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    // 백엔드 ReportCreateRequest DTO 형식에 맞게 데이터 조립
    // 제목 앞에 신고 유형을 괄호로 붙여서 보냅니다. 예: "[위생 불량] 냄새가 심해요"
    const requestBody = {
      title: `[${form.type}] ${form.title}`,
      content: form.content
    };

    try {
      await axios.post('/user/report', requestBody, {
        headers: authHeader()
        // axios가 Content-Type: application/json 자동 설정 ✅
      });
      alert("소중한 의견이 접수되었습니다.");
      // 폼 초기화
      setForm({ type: '불친절/서비스 불만', title: '', content: '' });
      // 목록 새로고침
      fetchReports();
    } catch (err) {
      console.error("신고 접수 실패:", err);
      // err.response?.data?.message: 백엔드가 보낸 에러 메시지 추출 (없으면 기본 문구)
      alert(err.response?.data?.message || "신고 접수에 실패했습니다.");
    }
  };

  // ── 신고 취소(삭제) (DELETE /user/report/{id}) ────────
  // 조건: PENDING(접수 대기) 상태인 신고만 삭제 가능
  // 백엔드 ReportService.deleteReport()에서도 동일하게 검증합니다.
  const handleDelete = async (reportId) => {
    // 사용자에게 최종 확인 요청
    if (!window.confirm("정말로 신고를 취소하시겠습니까?\n접수 대기 중인 신고만 취소할 수 있습니다.")) return;

    try {
      // DELETE 요청: body 없음, Authorization 헤더만 필요
      await axios.delete(`/user/report/${reportId}`, {
        headers: authHeader()
      });

      alert("신고가 취소되었습니다.");

      // 모달이 열려있으면 닫기
      setSelectedReport(null);

      // 삭제된 항목을 목록에서 즉시 제거 (서버 재조회 없이 UI 바로 반영)
      // prev: 이전 reports 배열, filter로 삭제된 id를 제외한 새 배열 반환
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error("신고 취소 실패:", err);
      alert(err.response?.data?.message || "신고 취소에 실패했습니다.");
    }
  };

  // ── 상태 뱃지 렌더링 ──────────────────────────────────
  // 신고 상태(status)에 따라 다른 색상의 뱃지 컴포넌트를 반환합니다.
  // className은 LocalCurrencyPage.css에 정의된 스타일을 재사용합니다.
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':     return <span className="lc-badge requested">접수</span>;
      case 'IN_PROGRESS': return <span className="lc-badge requested">처리 중</span>;
      case 'RESOLVED':    return <span className="lc-badge issued">처리 완료</span>;
      case 'REJECTED':    return <span className="lc-badge rejected">반려</span>;
      default:            return <span className="lc-badge used">{status}</span>;
    }
  };

  // ════════════════════════════════════════════════════
  // 📌 JSX 렌더링
  // ════════════════════════════════════════════════════
  return (
    <div className="mypage-subpage">
      <div className="mypage-white-box">

        {/* ── 로고 ── */}
        <div style={{
          color: 'black', fontSize: '1.8rem', fontWeight: 800,
          textAlign: 'center', marginBottom: '10px'
        }}>
          pleegie
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          📢 신고 및 불편사항 접수
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '20px' , color: '#888', fontSize: '0.9rem'}}>신고 내역은 총 3일 동안 보관을 하며 7일 이후에는 자동으로 삭제됩니다</p>

        {/* ════════════════════════════
            신고 접수 폼
        ════════════════════════════ */}
        <form onSubmit={handleSubmit}>

          {/* 신고 유형 선택 드롭다운 */}
          <div className="auth-field">
            <label className="auth-label">신고 유형</label>
            <select
              className="auth-input"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              style={{
                width: '100%', padding: '16px',
                border: '2px solid #fdd537', borderRadius: '16px',
                backgroundColor: '#fffbfa', fontSize: '0.95rem',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <option>불친절/서비스 불만</option>
              <option>위생 불량</option>
              <option>가격/정량 미달</option>
              <option>기타</option>
            </select>
          </div>

          {/* 제목 입력 */}
          <div className="auth-field">
            <label className="auth-label">제목</label>
            <input
              type="text"
              className="auth-input"
              placeholder="신고 제목을 입력하세요"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              style={{
                width: '100%', padding: '16px',
                border: '2px solid #fdd537', borderRadius: '16px',
                backgroundColor: '#fffbfa', fontSize: '0.95rem',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
            />
          </div>

          {/* 상세 내용 입력 */}
          <div className="auth-field">
            <label className="auth-label">상세 내용</label>
            <textarea
              className="auth-input"
              style={{
                height: '200px', padding: '16px',
                border: '2px solid #fdd537', borderRadius: '16px',
                backgroundColor: '#fffbfa', fontSize: '0.95rem',
                lineHeight: '1.6', resize: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
              placeholder="구체적인 신고 내용을 입력해주세요."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
            />
          </div>

          {/* 버튼 영역: 돌아가기 + 신고하기 */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="auth-submit-btn"
              style={{ flex: 1, margin: 0 }}
              onClick={() => navigate(-1)} // 뒤로 돌아가기 버튼 (-1 , 냉장고 페이지에서 들어가면 냉장고 페이지로 , 마이페이지에서 들어가면 마이페이지로 )
            >
              돌아가기
            </button>
            <button
              type="submit"
              className="auth-submit-btn"
              style={{ flex: 1, margin: 0 }}
            >
              신고하기
            </button>
          </div>
        </form>

        {/* ════════════════════════════
            나의 신고 내역 목록
        ════════════════════════════ */}
        <div style={{ marginTop: '40px' }}>
          <h3 style={{
            fontFamily: 'var(--font-title)', fontSize: '1.2rem',
            color: '#2a1f0e', marginBottom: '16px',
            paddingBottom: '10px', borderBottom: '1.5px dashed rgba(0,0,0,0.1)'
          }}>
            나의 신고 내역
          </h3>

          <div className="lc-list">
            {/* 로딩 중 */}
            {loading ? (
              <p style={{ textAlign: 'center', color: '#aaa', padding: '30px 0' }}>
                내역을 불러오는 중...
              </p>

            /* 신고 내역 없음 */
            ) : reports.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa', padding: '30px 0', fontSize: '0.9rem' }}>
                아직 신고 내역이 없어요.
              </p>

            /* 신고 내역 목록 렌더링 */
            ) : (
              reports.map(item => (
                <div
                  key={item.id}
                  className="lc-item"
                  style={{ display: 'block', padding: '16px' }}
                >
                  {/* 제목 + 상태 뱃지 행: 클릭 시 모달 오픈 */}
                  <div
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '8px', cursor: 'pointer'
                    }}
                    onClick={() => setSelectedReport(item)}
                  >
                    <span style={{
                      fontWeight: 700, color: '#2a1f0e', fontSize: '1rem',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', width: '70%'
                    }}>
                      {item.title}
                    </span>
                    {renderStatusBadge(item.status)}
                  </div>

                  {/* 내용 미리보기: 클릭 시 모달 오픈 */}
                  <p
                    style={{
                      fontSize: '0.9rem', color: '#2a1f0e',
                      margin: '0 0 10px', lineHeight: 1.5,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', cursor: 'pointer'
                    }}
                    onClick={() => setSelectedReport(item)}
                  >
                    {item.content}
                  </p>

                  {/* 날짜 + 취소 버튼 행 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: '#2a1f0e' }}>
                      {new Date(item.createdAt).toLocaleDateString('ko-KR')} 접수
                    </span>

                    {/*
                      PENDING 상태일 때만 취소 버튼 노출
                      - e.stopPropagation(): 버튼 클릭이 부모 div의 onClick(모달 열기)까지
                        전파되지 않도록 이벤트 버블링을 차단합니다.
                    */}
                    {item.status === 'PENDING' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // 🔑 부모 클릭 이벤트 차단
                          handleDelete(item.id);
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f8cece',
                          border: '1px solid #ff4d4f',
                          borderRadius: '8px',
                          color: '#ff4d4f',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        취소
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          신고 상세 모달
          - selectedReport가 null이 아닐 때만 렌더링됩니다.
          - 오버레이(배경) 클릭 → 모달 닫기
          - 모달 내부 클릭 → e.stopPropagation()으로 닫힘 방지
      ════════════════════════════════════════════════════ */}
      {selectedReport && (
        <div
          onClick={() => setSelectedReport(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()} // 모달 내부 클릭 시 닫힘 방지
            style={{
              backgroundColor: '#fff',
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '400px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              boxSizing: 'border-box',
            }}
          >
            {/* 모달 헤더: 제목 + 닫기(X) 버튼 */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1.5px dashed #eee',
              paddingBottom: '16px', marginBottom: '16px',
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#2a1f0e' }}>
                신고 상세 내역
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                style={{
                  background: 'none', border: 'none',
                  fontSize: '1.4rem', cursor: 'pointer', color: '#888'
                }}
              >
                ✕
              </button>
            </div>

            {/* 접수일 + 상태 뱃지 */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '12px'
            }}>
              <span style={{ fontSize: '0.9rem',fontWeight:"normal", color: '#2a1f0e' }}>
                {new Date(selectedReport.createdAt).toLocaleDateString('ko-KR')} 등록(접수)
              </span>
              {renderStatusBadge(selectedReport.status)}
            </div>

            {/* 신고 제목 박스 */}
            <div style={{
              fontWeight: 500, fontSize: '1.3rem', color: '#2a1f0e',
              marginBottom: '16px', lineHeight: 1.5,
              wordBreak: 'break-all',       // 긴 단어 강제 줄바꿈
              overflowWrap: 'break-word',
              padding: '12px 14px',
              background: '#fafafa',
              borderRadius: '10px',
              border: '1px solid #f0ebe0',
            }}>
              {selectedReport.title}
            </div>

            {/* 상세 내용 레이블 */}
            <div style={{ fontSize: '0.9rem',fontWeight:"normal" ,color: '#2a1f0e', marginBottom: '8px' }}>
              상세 내용
            </div>

            {/* 신고 본문 */}
            <div style={{
              backgroundColor: '#fdfcf0',
              border: '1px solid #fce8a1',
              padding: '16px',
              borderRadius: '16px',
              fontSize: '1rem',
              fontWeight: "normal",
              color: '#2a1f0e',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',   // 줄바꿈(\n) 그대로 유지
              wordBreak: 'break-all',   // 긴 단어 강제 줄바꿈
              overflowWrap: 'break-word',
              minHeight: '100px',
              maxHeight: '200px',       // 너무 길면 스크롤
              overflowY: 'auto',
            }}>
              {selectedReport.content}
            </div>

            {/*
              PENDING 상태일 때만 모달 안에서도 신고 취소 버튼 표시
              사용자가 상세 내용을 확인하고 바로 취소 결정 가능
            */}
            {selectedReport.status === 'PENDING' && (
              <button
                onClick={() => handleDelete(selectedReport.id)}
                style={{
                  width: '100%', padding: '14px',
                  background: '#ff4d4f', color: '#fff',
                  border: '2px solid #ff4d4f',
                  borderRadius: '14px',
                  fontWeight: 700, marginTop: '16px',
                  cursor: 'pointer', fontSize: '1rem',
                  fontFamily: 'var(--font-title)',
                }}
              >
                신고 취소하기
              </button>
            )}

            {/* 닫기 버튼 */}
            <button
              onClick={() => setSelectedReport(null)}
              style={{
                width: '100%', padding: '14px',
                background: '#fdd537', color: '#2a1f0e',
                border: 'none', borderRadius: '14px',
                fontWeight: 700, marginTop: '10px',
                cursor: 'pointer', fontSize: '1rem',
                fontFamily: 'var(--font-title)',
              }}
            >
              닫기 (지워주세요 !!!!)
            </button>
          </div>
        </div>
      )}
      <button>
        버튼(수정)
      </button>
    </div>
  );
}