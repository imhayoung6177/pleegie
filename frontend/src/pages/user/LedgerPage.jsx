import React, { useState } from 'react';

const LedgerPage = ({ ledgerItems: propItems = [] }) => {
  const [items, setItems] = useState([
    { id: 1, name: '시장 장보기', price: 28500, date: '2025-04-20', },
    { id: 2, name: '계란 한판',   price: 8900,  date: '2025-04-18', },
    ...(propItems || []),
  ]);
  const [form, setForm] = useState({ name: '', price: '' });

  const handleAdd = () => {
    if (!form.name.trim() || !form.price) return;
    setItems(prev => [{
      id: Date.now(),
      name: form.name,
      price: Number(form.price),
      date: new Date().toLocaleDateString('ko-KR'),
      emoji: '🧾',
    }, ...prev]);
    setForm({ name: '', price: '' });
  };

  const handleDelete = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const total = items.reduce((s, i) => s + i.price, 0);

  return (
    <div>
      {/* 지출 합계 카드 */}
      <div style={{
        background: '#FF6B35',
        padding: '24px', borderRadius: '20px', color: 'white',
        textAlign: 'center', marginBottom: '20px',
      }}>
        <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '6px' }}>
          이번 달 총 지출
        </div>
        <div style={{
          fontSize: '2rem', fontWeight: 800,
          fontFamily: "var(--font-title)",
        }}>
          {total.toLocaleString()}원
        </div>
      </div>

      {/* 직접 입력 폼 */}
      <div style={{
        background: 'rgba(0,0,0,0.03)',
        borderRadius: '16px', padding: '16px',
        marginBottom: '16px',
        border: '1.5px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{
          fontSize: '0.85rem', fontWeight: 700,
          color: '#FF6B35', marginBottom: '10px',
        }}>
          + 지출 직접 입력
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text" placeholder="항목명"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            style={{
              flex: 2, minWidth: '100px', padding: '10px 12px', borderRadius: '10px',
              border: '1.5px solid rgba(0,0,0,0.12)',
              fontSize: '0.88rem', outline: 'none',
            }}
          />
          <input
            type="number" placeholder="금액(원)"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            style={{
              flex: 1, minWidth: '80px', padding: '10px 12px', borderRadius: '10px',
              border: '1.5px solid rgba(0,0,0,0.12)',
              fontSize: '0.88rem', outline: 'none',
            }}
          />
          <button
            onClick={handleAdd}
            style={{
              padding: '10px 16px', borderRadius: '10px',
              background: '#FF6B35', color: 'white',
              border: 'none', fontWeight: 700,
              fontSize: '0.88rem', cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            추가
          </button>
        </div>
      </div>

      {/* 지출 목록 */}
      <div style={{
        background: 'rgba(255,255,255,0.7)',
        borderRadius: '16px', padding: '8px',
      }}>
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa', padding: '24px 0' }}>
            아직 지출 내역이 없어요
          </p>
        ) : items.map(item => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center',
            padding: '14px 10px',
            borderBottom: '1px dashed rgba(0,0,0,0.08)',
          }}>
            <div style={{ fontSize: '1.3rem', marginRight: '12px' }}>{item.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: '#444', fontSize: '0.9rem' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                {item.date}
              </div>
            </div>
            <div style={{ fontWeight: 800, color: '#FF6B35', marginRight: '10px' }}>
              -{item.price.toLocaleString()}원
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              style={{
                background: 'none', border: 'none',
                color: '#ccc', cursor: 'pointer',
                fontSize: '1rem', padding: '4px',
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LedgerPage;