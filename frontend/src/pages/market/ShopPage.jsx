import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/market/ShopPage.css';
import '../../Styles/user/FridgePage.css'; // 냉장고 UI 적용

/* ══════════════════════════════════════════════════════════
   상수 & 유틸
══════════════════════════════════════════════════════════ */

// 현재 시각 기준으로 할인 상태 계산
const getSaleStatus = (item, now) => {
  if (!item.saleStart || !item.saleEnd || (!item.discountRate && !item.salePrice)) return 'none';

  const [startH, startM] = item.saleStart.split(':').map(Number);
  const [endH,   endM]   = item.saleEnd.split(':').map(Number);

  const start = new Date(now);
  start.setHours(startH, startM, 0, 0);
  const end = new Date(now);
  end.setHours(endH, endM, 0, 0);
  const soon = new Date(start.getTime() - 60 * 60 * 1000); // 1시간 전

  if (now >= start && now < end) return 'active';   // 할인 중
  if (now >= soon  && now < start) return 'soon';   // 1시간 전
  return 'none';
};

// 가격 계산
const getDisplayPrice = (item, status) => {
  if (status === 'active') {
    if (item.salePrice) return item.salePrice;
    if (item.discountRate) return Math.round(item.price * (1 - item.discountRate / 100));
  }
  return item.price;
};

// 시간 남은 문자열
const getTimeLeft = (item, now, status) => {
  if (status === 'none') return null;
  const [h, m] = (status === 'soon' ? item.saleStart : item.saleEnd).split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  const diffMs = target - now;
  if (diffMs <= 0) return null;
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  if (mins >= 60) return `${Math.floor(mins / 60)}시간 ${mins % 60}분 후`;
  if (mins > 0) return `${mins}분 ${secs}초 후`;
  return `${secs}초 후`;
};

/* ══════════════════════════════════════════════════════════
   할인 설정 모달
══════════════════════════════════════════════════════════ */
const DiscountModal = ({ item, onSave, onClose }) => {
  const [saleStart,    setSaleStart]    = useState(item.saleStart    || '18:00');
  const [saleEnd,      setSaleEnd]      = useState(item.saleEnd      || '20:00');
  const [salePrice,    setSalePrice]    = useState(item.salePrice    || (item.discountRate ? Math.round(item.price * (1 - item.discountRate / 100)) : item.price));

  const currentDiscountRate = item.price && salePrice ? Math.round((1 - salePrice / item.price) * 100) : 0;
  const PRESETS = [10, 20, 30, 50, 70];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="discount-modal" onClick={e => e.stopPropagation()}>

        {/* 모달 상단 */}
        <div className="discount-modal-top">
          <span className="discount-modal-emoji">{item.emoji}</span>
          <span className="discount-modal-name">{item.name} 할인 설정</span>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="discount-form">
          {/* 할인가 */}
          <div className="discount-field">
            <label className="discount-label">할인가 (원)</label>
            <input
              className="discount-inp"
              type="number"
              value={salePrice}
              onChange={e => setSalePrice(Number(e.target.value))}
            />
            <div className="discount-presets">
              {PRESETS.map(p => (
                <button
                  key={p}
                  className={`discount-preset-btn ${currentDiscountRate === p ? 'active' : ''}`}
                  onClick={() => setSalePrice(Math.round(item.price * (1 - p / 100)))}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          {/* 할인 시작 시각 */}
          <div className="discount-field">
            <label className="discount-label">할인 시작 시각</label>
            <input
              className="discount-inp"
              type="time"
              value={saleStart}
              onChange={e => setSaleStart(e.target.value)}
            />
          </div>

          {/* 할인 종료 시각 */}
          <div className="discount-field">
            <label className="discount-label">할인 종료 시각</label>
            <input
              className="discount-inp"
              type="time"
              value={saleEnd}
              onChange={e => setSaleEnd(e.target.value)}
            />
          </div>

          {/* 미리보기 */}
          <div className="discount-preview">
            <span className="discount-preview-label">할인 적용 가격</span>
            <div className="discount-preview-price">
              <span className="original-price">{item.price.toLocaleString()}원</span>
              <span className="sale-price">{salePrice.toLocaleString()}원</span>
            </div>
          </div>

          <button
            className="modal-submit-btn"
            onClick={() => { onSave({ saleStart, saleEnd, salePrice, discountRate: currentDiscountRate }); onClose(); }}
          >
            할인 설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   상품 카드
══════════════════════════════════════════════════════════ */
const ProductCard = ({ item, now, onEdit, onDelete, onDiscount }) => {
  const status      = getSaleStatus(item, now);
  const displayPrice = getDisplayPrice(item, status);
  const timeLeft    = getTimeLeft(item, now, status);

  return (
    <div className={`product-card ${status === 'soon' ? 'sale-soon' : ''} ${status === 'active' ? 'on-sale' : ''}`}>

      {/* 이미지(이모지) 영역 */}
      <div className="product-emoji-wrap">
        {item.emoji}
        {status === 'soon' && (
          <span className="sale-badge soon-badge">⏰ 임박</span>
        )}
        {status === 'active' && (
          <span className="sale-badge active-badge">🔴 할인 중</span>
        )}
      </div>

      {/* 상품명 */}
      <div className="product-name">{item.name}</div>

      {/* 가격 */}
      <div className="product-price-wrap">
        {status === 'active' && (
          <span className="product-original-price">
            {item.price.toLocaleString()}원/{item.unit}
          </span>
        )}
        <span className={`product-price ${status === 'active' ? 'discounted' : ''}`}>
          {displayPrice.toLocaleString()}원/{item.unit}
        </span>
        {(item.discountRate || item.salePrice) && status !== 'active' && status !== 'none' && (
          <span style={{ fontSize: '0.72rem', color: '#FF6B35' }}>
            {item.discountRate || Math.round((1 - item.salePrice / item.price) * 100)}% 할인 예정
          </span>
        )}
      </div>

      {/* 할인 시간 */}
      {timeLeft && (
        <div className={`product-sale-time ${status}`}>
          {status === 'soon'   && `⏰ ${timeLeft} 할인 시작`}
          {status === 'active' && `🔴 ${timeLeft} 후 종료`}
        </div>
      )}
      {!timeLeft && item.saleStart && status === 'none' && (
        <div className="product-sale-time">
          🕐 {item.saleStart}~{item.saleEnd} 할인
        </div>
      )}

      {/* 버튼 */}
      <div className="product-card-btns">
        <button className="product-edit-btn" onClick={() => onDiscount(item)}>
          할인 설정
        </button>
        <button className="product-delete-btn" onClick={() => onDelete(item.id)}>
          삭제
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   메인 상인 대시보드
══════════════════════════════════════════════════════════ */
export default function ShopPage() {
  const navigate = useNavigate();
  const shopName = localStorage.getItem('shopName') || '김씨네 채소가게';

  // 현재 시각 (1초마다 갱신)
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // 상품 목록 (로컬 스토리지 연동)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('marketItems');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1, name: '시금치',   emoji: '🥬', price: 3000, unit: '봉', shopName: shopName,
        saleStart: '18:00', saleEnd: '20:00', discountRate: 50, salePrice: 1500,
      },
      {
        id: 2, name: '대파',     emoji: '🌿', price: 2500, unit: '봉', shopName: shopName,
        saleStart: '19:00', saleEnd: '21:00', discountRate: 30, salePrice: 1750,
      },
      {
        id: 3, name: '계란',     emoji: '🥚', price: 8000, unit: '판', shopName: shopName,
        saleStart: '', saleEnd: '', discountRate: 0, salePrice: null,
      },
      {
        id: 4, name: '돼지고기', emoji: '🐷', price: 15000, unit: 'kg', shopName: shopName,
        saleStart: '17:00', saleEnd: '19:00', discountRate: 20, salePrice: 12000,
      },
    ];
  });

  // 변경 시 로컬 스토리지에 자동 저장 (사용자 화면과 연동)
  useEffect(() => {
    localStorage.setItem('marketItems', JSON.stringify(products));
  }, [products]);

  const [discountTarget, setDiscountTarget] = useState(null); // 할인 설정할 상품
  const [toast, setToast]         = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // 상품 삭제
  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('상품이 삭제됐어요');
  };

  // 할인 저장
  const handleSaveDiscount = ({ saleStart, saleEnd, salePrice, discountRate }) => {
    setProducts(prev => prev.map(p =>
      p.id === discountTarget.id ? { ...p, saleStart, saleEnd, salePrice, discountRate } : p
    ));
    showToast(`${discountTarget.emoji} ${discountTarget.name} 할인 설정 완료!`);
  };

  // 통계
  const onSaleCount = products.filter(p => getSaleStatus(p, now) === 'active').length;
  const soonCount   = products.filter(p => getSaleStatus(p, now) === 'soon').length;

  return (
    <div className="fridge-page">
      {/* ══ 헤더 ══ */}
      <div className="page-header">
        <h1 className="page-title">pleegie</h1>
        <div className="header-actions">
          <button className="header-user-btn" onClick={() => navigate('/market/mypage')}>
            <span className="header-user-emoji">
              🏪</span>
            <span className="header-user-name">{shopName}</span>
          </button>
          <button className="header-logout-btn" onClick={() => { localStorage.clear(); window.location.href = '/'; }}>
            로그아웃
          </button>
        </div>
      </div>

      <div className="fridge-outer">
        <div className="fridge-top-panel">
          <span 
            className="fridge-brand" 
            onClick={() => navigate('/market/mypage')}
            style={{ cursor: 'pointer' }}
          >
            {shopName}
          </span>
        </div>
        
        <div className="fridge-ai-bar">
          <button className="ai-btn ai-btn-orange" onClick={() => navigate('/market/items')}>
            <strong>재료 등록하기</strong>
          </button>
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: '#5a4a32', fontWeight: 'bold' }}>
            <span>할인 임박: <span style={{color: '#FF6B35'}}>{soonCount}</span>건</span>
            <span>할인 중: <span style={{color: '#E53535'}}>{onSaleCount}</span>건</span>
          </div>
        </div>
        
        <div className="fridge-divider" />
        
        <div className="fridge-interior">
          <div className="fridge-ceiling-light" />
          <div className="product-grid" style={{ padding: '0 16px 20px', position: 'relative', zIndex: 2 }}>
            {products.length === 0 ? (
              <div className="fridge-empty" style={{ gridColumn: '1 / -1' }}>
                <span className="empty-icon">📦</span>
                <div className="empty-title">등록된 품목이 없어요</div>
                <div className="empty-sub">재료 등록하기를 눌러 추가해보세요.</div>
              </div>
            ) : (
              products.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  now={now}
                  onDiscount={(p) => setDiscountTarget(p)}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
        
        <div className="fridge-bottom">
          <span className="item-count">등록된 품목 {products.length}개</span>
        </div>
      </div>

      {/* ══ 할인 설정 모달 ══ */}
      {discountTarget && (
        <DiscountModal
          item={discountTarget}
          onSave={handleSaveDiscount}
          onClose={() => setDiscountTarget(null)}
        />
      )}

      {/* ══ 토스트 ══ */}
      {toast && <div className="shop-toast">{toast}</div>}
    </div>
  );
}