import React, { useState, useEffect } from 'react';

const LedgerPage = ({ onBack }) => {
  // ✅ 상태 관리
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', price: '', category: '식비' });

  // ✅ 공통 인증 헤더
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  // ✅ 1. 가계부 목록 불러오기 (GET /user/money-log)
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // 약속된 GET /user/money-log 호출
      const response = await fetch('/user/money-log', { 
        method: 'GET',
        headers: getAuthHeaders() 
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        // 백엔드 ApiResponse 구조(result.data)에 맞춰 저장
        setItems(result.data || []);
      }
    } catch (err) {
      console.error("가계부 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 2. 지출 내역 직접 추가 (POST /user/money-log)
  const handleAdd = async () => {
    if (!form.name.trim() || !form.price) return;

    try {
      const response = await fetch('/user/money-log', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: form.name,
          total: Number(form.price),
          category: form.category,
          memo: "" // DTO 구조에 맞춰 빈 값 전달
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 추가 성공 시 목록 새로고침 및 폼 초기화
        fetchLogs();
        setForm({ name: '', price: '', category: '식비' });
      }
    } catch (err) {
      console.error("지출 저장 실패:", err);
    }
  };

  // ✅ 3. 삭제 기능 (프론트 우선 처리)
  const handleDelete = async (id) => {
    if (!window.confirm("기록을 삭제하시겠습니까?")) return;
    try {
      const response = await fetch(`/user/money-log/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const result = await response.json();
      if (result.success) {
        setItems(prev => prev.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  // 합계 계산 (데이터의 total 필드 기준)
  const totalSpend = items.reduce((s, i) => s + (i.total || 0), 0);

  if (loading) return <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>지출 내역을 불러오는 중...</div>;

  return (
    <div>
      {/* 🟡 지출 합계 카드 (디자인 유지) */}
      <div style={{
        background: '#fdd537',
        padding: '24px', borderRadius: '20px', color: '#2a1f0e',
        textAlign: 'center', marginBottom: '20px',
      }}>
        <div style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '6px' }}>이번 달 총 지출</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: "var(--font-title)" }}>
          {totalSpend.toLocaleString()}원
        </div>
      </div>

      {/* ✏️ 직접 입력 폼 (디자인 유지) */}
      <div style={{
        background: 'rgba(0,0,0,0.03)',
        borderRadius: '16px', padding: '16px',
        marginBottom: '16px',
        border: '1.5px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'black', marginBottom: '10px' }}>
          + 지출 직접 입력
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text" placeholder="항목명"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            style={{ flex: 2, minWidth: '100px', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid rgba(0,0,0,0.12)', fontSize: '0.88rem' }}
          />
          <input
            type="number" placeholder="금액(원)"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            style={{ flex: 1, minWidth: '80px', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid rgba(0,0,0,0.12)', fontSize: '0.88rem' }}
          />
          <button
            onClick={handleAdd}
            style={{ padding: '10px 16px', borderRadius: '10px', background: '#fdd537', color: '#2a1f0e', border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            추가
          </button>
        </div>
      </div>

      {/* 📋 지출 목록 (백엔드 데이터 렌더링) */}
      <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '8px' }}>
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#2a1f0e', padding: '24px 0' }}>아직 지출 내역이 없어요</p>
        ) : items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 10px', borderBottom: '1px dashed rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '1.3rem', marginRight: '12px' }}>
               {/* 장바구니 연동 항목이면 카트, 수기 입력이면 영수증 아이콘 */}
               {item.cartId ? '🛒' : '🧾'} 
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: '#444', fontSize: '1rem' }}>{item.title}</div>
              <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '2px' }}>
                {/* LocalDateTime 날짜 변환 */}
                {new Date(item.purchaseDate).toLocaleDateString('ko-KR')}
              </div>
            </div>
            <div style={{ fontWeight: 800, color: '#2a1f0e', marginRight: '10px' }}>
              -{item.total.toLocaleString()}원
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}
            >✕</button>
          </div>
        ))}
      </div>

      {/* 뒤로가기 버튼 */}
      <button className="auth-submit-btn" style={{ marginTop: '24px', width: '100%' }} onClick={onBack}>
        뒤로 가기
      </button>
    </div>
  );
};

export default LedgerPage;