import React, { useState, useEffect } from 'react';

const LedgerPage = () => {
  // ✅ 1. 백엔드에서 가져온 실제 지출 내역을 저장할 상태
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', price: '', category: '식비' });

  // 공통 인증 헤더
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  // ✅ 2. 페이지 진입 시 가계부 목록 불러오기 (GET)
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // 백엔드 MoneyLogController의 @GetMapping 주소와 일치시킴
      const response = await fetch('/user/money-log', { headers: getAuthHeaders() });
      const result = await response.json();
      
      if (response.ok) {
        // 백엔드에서 온 데이터를 리액트 형식에 맞게 가공하여 저장
        setItems(result.data || []);
      }
    } catch (err) {
      console.error("가계부 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 3. 지출 내역 직접 추가하기 (POST)
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
          memo: "" // 필요 시 메모 기능 추가 가능
        })
      });

      if (response.ok) {
        // 추가 성공 시 목록을 다시 불러옵니다.
        fetchLogs();
        setForm({ name: '', price: '', category: '식비' });
      }
    } catch (err) {
      console.error("지출 저장 실패:", err);
    }
  };

  // 삭제 기능 (현재 백엔드 컨트롤러에 DELETE가 없으므로 프론트에서만 처리하거나 백엔드 추가 필요)
  const handleDelete = (id) => {
    // 팀원에게 @DeleteMapping("/user/money-log/{id}") 만들어 달라고 하세요!
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // 합계 계산 (백엔드에서 온 total 필드 기준)
  const total = items.reduce((s, i) => s + (i.total || 0), 0);

  if (loading) return <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>지출 내역을 불러오는 중...</div>;

  return (
    <div>
      {/* 지출 합계 카드 (디자인 유지) */}
      <div style={{
        background: '#fdd537',
        padding: '24px', borderRadius: '20px', color: '#2a1f0e',
        textAlign: 'center', marginBottom: '20px',
      }}>
        <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '6px' }}>이번 달 총 지출</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: "var(--font-title)" }}>
          {total.toLocaleString()}원
        </div>
      </div>

      {/* 직접 입력 폼 (디자인 유지) */}
      <div style={{
        background: 'rgba(0,0,0,0.03)',
        borderRadius: '16px', padding: '16px',
        marginBottom: '16px',
        border: '1.5px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'black', marginBottom: '10px' }}>
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

      {/* 지출 목록 (백엔드 데이터 렌더링) */}
      <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '8px' }}>
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#2a1f0e', padding: '24px 0' }}>아직 지출 내역이 없어요</p>
        ) : items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 10px', borderBottom: '1px dashed rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '1.3rem', marginRight: '12px' }}>
               {/* 카테고리에 따른 자동 이모지 설정 */}
               {item.cartId ? '🛒' : '🧾'} 
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: '#444', fontSize: '0.9rem' }}>{item.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                {/* LocalDateTime 형식을 읽기 좋게 변환 */}
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
    </div>
  );
};

export default LedgerPage;