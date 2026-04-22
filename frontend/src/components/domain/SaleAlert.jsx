import React, { useState, useEffect } from 'react';
import './SaleAlert.css';

/* ══════════════════════════════════════════════════════════
   SaleAlert.css 인라인 스타일 (별도 CSS 없이 사용 가능)
   사용자 냉장고 페이지에서 "없는 재료" 표시 시
   할인 임박/할인 중 여부를 버튼 색상으로 구분

   사용법:
   <SaleAlertButton item={marketItem} myIngredients={items} />
══════════════════════════════════════════════════════════ */

const getSaleStatus = (item, now) => {
  if (!item.saleStart || !item.saleEnd || !item.discountRate) return 'none';

  const [startH, startM] = item.saleStart.split(':').map(Number);
  const [endH,   endM]   = item.saleEnd.split(':').map(Number);

  const start = new Date(now);
  start.setHours(startH, startM, 0, 0);
  const end = new Date(now);
  end.setHours(endH, endM, 0, 0);
  const soon = new Date(start.getTime() - 60 * 60 * 1000);

  if (now >= start && now < end) return 'active';
  if (now >= soon  && now < start) return 'soon';
  return 'none';
};

/* ── 개별 마켓 품목 버튼 ── */
export const SaleAlertButton = ({ item, onClick }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);

  const status = getSaleStatus(item, now);
  const displayPrice = status === 'active'
    ? Math.round(item.price * (1 - item.discountRate / 100))
    : item.price;

  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Jua', sans-serif",
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    width: '100%',
    textAlign: 'left',
  };

  const statusStyle = {
    none: {
      background: 'rgba(255,255,255,0.8)',
      color: '#2a1f0e',
      border: '1.5px solid rgba(0,0,0,0.1)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    },
    soon: {
      background: 'rgba(255,107,53,0.08)',
      color: '#D94F1E',
      border: '1.5px solid rgba(255,107,53,0.35)',
      boxShadow: '0 2px 10px rgba(255,107,53,0.15)',
      animation: 'soonPulse 1.8s ease-in-out infinite',
    },
    active: {
      background: '#E53535',
      color: 'white',
      border: '1.5px solid #C82020',
      boxShadow: '0 3px 0 #A01010, 0 5px 16px rgba(229,53,53,0.35)',
    },
  };

  return (
    <>
      <style>{`
        @keyframes soonPulse {
          0%,100% { box-shadow: 0 2px 10px rgba(255,107,53,0.15); }
          50%      { box-shadow: 0 2px 18px rgba(255,107,53,0.35); }
        }
        .sale-alert-btn:hover { transform: translateY(-2px); }
        .sale-alert-btn:active { transform: translateY(0); }
      `}</style>

      <button
        className="sale-alert-btn"
        style={{ ...baseStyle, ...statusStyle[status] }}
        onClick={onClick}
      >
        <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{item.emoji}</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontWeight: 700 }}>{item.name}</span>
          <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>
            {item.shopName} · {displayPrice.toLocaleString()}원/{item.unit}
            {status === 'active' && ` (${item.discountRate}% 할인 중!)`}
            {status === 'soon'   && ` (${item.discountRate}% 할인 임박!)`}
          </span>
        </div>
        {status !== 'none' && (
          <span style={{
            padding: '3px 8px',
            borderRadius: 999,
            fontSize: '0.68rem',
            fontWeight: 700,
            background: status === 'active' ? 'rgba(255,255,255,0.25)' : 'rgba(255,107,53,0.9)',
            color: 'white',
            whiteSpace: 'nowrap',
          }}>
            {status === 'active' ? '🔴 할인 중' : '⏰ 임박'}
          </span>
        )}
      </button>
    </>
  );
};

/* ── 냉장고 페이지에서 없는 재료 목록에 사용 ── */
export const SaleAlertList = ({ missingIngredients, marketItems }) => {
  // 내 냉장고에 없는 재료 중 시장에 있는 품목만 필터
  const matchedItems = marketItems.filter(m =>
    missingIngredients.some(ing =>
      m.name.includes(ing) || ing.includes(m.name)
    )
  );

  if (matchedItems.length === 0) return null;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.7)',
      border: '1.5px solid rgba(255,107,53,0.18)',
      borderRadius: 16,
      padding: '16px 16px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ fontFamily: "'Jua', sans-serif", fontSize: '0.92rem', color: '#5a4a32', marginBottom: 4 }}>
        🏪 가까운 시장에서 구매 가능
      </div>
      {matchedItems.map(item => (
        <SaleAlertButton
          key={item.id}
          item={item}
          onClick={() => alert(`${item.shopName}으로 이동합니다!`)}
        />
      ))}
    </div>
  );
};

/* ══ 데모용 Mock 마켓 데이터 ══════════════════════════
   실제 구현 시 백엔드 API에서 가져올 데이터 구조 예시
══════════════════════════════════════════════════════ */
export const MOCK_MARKET_ITEMS = [
  {
    id: 1,  name: '시금치',   emoji: '🥬', price: 3000,  unit: '봉',
    shopName: '김씨네 채소', saleStart: '18:00', saleEnd: '20:00', discountRate: 50,
  },
  {
    id: 2,  name: '대파',     emoji: '🌿', price: 2500,  unit: '봉',
    shopName: '김씨네 채소', saleStart: '19:00', saleEnd: '21:00', discountRate: 30,
  },
  {
    id: 3,  name: '돼지고기', emoji: '🐷', price: 15000, unit: 'kg',
    shopName: '박씨 정육점', saleStart: '17:00', saleEnd: '19:00', discountRate: 20,
  },
  {
    id: 4,  name: '당근',     emoji: '🥕', price: 1500,  unit: '개',
    shopName: '이씨 야채가게', saleStart: '', saleEnd: '', discountRate: 0,
  },
  {
    id: 5,  name: '두부',     emoji: '🫙', price: 2000,  unit: '모',
    shopName: '전통시장 두부집', saleStart: '17:30', saleEnd: '20:00', discountRate: 40,
  },
];

export default SaleAlertList;