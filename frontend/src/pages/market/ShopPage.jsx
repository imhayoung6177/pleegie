import React, { useState, useEffect } from 'react';
import '../../Styles/market/ShopPage.css';

/* ══════════════════════════════════════════════════════════
   상수 & 유틸
══════════════════════════════════════════════════════════ */

// 선택 가능한 이모지 (식재료 카테고리별)
const EMOJI_LIST = [
  '🥩','🍗','🥚','🐷','🥓',           // 육류
  '🥦','🧅','🥕','🌿','🥔','🍅','🥒','🍄','🌶️','🥬', // 채소
  '🦐','🐟','🦑','🦪','🐚',           // 해산물
  '🥛','🧈','🧀','🫙','🍶',           // 유제품
  '🌾','🍞','🍝',                      // 곡류
  '🍎','🍊','🍋','🍇','🍓','🍑',      // 과일
];

const UNITS = ['원/kg', '원/개', '원/봉', '원/팩', '원/L'];

// 현재 시각 기준으로 할인 상태 계산
const getSaleStatus = (item, now) => {
  if (!item.saleStart || !item.saleEnd || !item.discountRate) return 'none';

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
  if ((status === 'active') && item.discountRate) {
    return Math.round(item.price * (1 - item.discountRate / 100));
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
  const [discountRate, setDiscountRate] = useState(item.discountRate || 30);

  const PRESETS = [10, 20, 30, 50, 70];
  const salePrice = Math.round(item.price * (1 - discountRate / 100));

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
          {/* 할인율 */}
          <div className="discount-field">
            <label className="discount-label">할인율 (%)</label>
            <input
              className="discount-inp"
              type="number"
              min="1" max="99"
              value={discountRate}
              onChange={e => setDiscountRate(Number(e.target.value))}
            />
            <div className="discount-presets">
              {PRESETS.map(p => (
                <button
                  key={p}
                  className={`discount-preset-btn ${discountRate === p ? 'active' : ''}`}
                  onClick={() => setDiscountRate(p)}
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
            onClick={() => { onSave({ saleStart, saleEnd, discountRate }); onClose(); }}
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
        {item.discountRate && status !== 'active' && status !== 'none' && (
          <span style={{ fontSize: '0.72rem', color: '#FF6B35' }}>
            {item.discountRate}% 할인 예정
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
        saleStart: '18:00', saleEnd: '20:00', discountRate: 50,
      },
      {
        id: 2, name: '대파',     emoji: '🌿', price: 2500, unit: '봉', shopName: shopName,
        saleStart: '19:00', saleEnd: '21:00', discountRate: 30,
      },
      {
        id: 3, name: '계란',     emoji: '🥚', price: 8000, unit: '판', shopName: shopName,
        saleStart: '', saleEnd: '', discountRate: 0,
      },
      {
        id: 4, name: '돼지고기', emoji: '🐷', price: 15000, unit: 'kg', shopName: shopName,
        saleStart: '17:00', saleEnd: '19:00', discountRate: 20,
      },
    ];
  });

  // 변경 시 로컬 스토리지에 자동 저장 (사용자 화면과 연동)
  useEffect(() => {
    localStorage.setItem('marketItems', JSON.stringify(products));
  }, [products]);

  // 폼 상태
  const [form, setForm]           = useState({ name: '', price: '', unit: '원/개', emoji: '🥬' });
  const [selectedEmoji, setEmoji] = useState('🥬');
  const [discountTarget, setDiscountTarget] = useState(null); // 할인 설정할 상품
  const [toast, setToast]         = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // 상품 등록
  const handleAddProduct = () => {
    if (!form.name.trim() || !form.price) {
      showToast('상품명과 가격을 입력해주세요!');
      return;
    }
    const newItem = {
      id: Date.now(),
      name: form.name,
      emoji: selectedEmoji,
      price: Number(form.price),
      unit: form.unit.replace('원/', ''),
      saleStart: '', saleEnd: '', discountRate: 0,
      shopName: shopName, // 사용자 화면에 보일 상점 이름 추가
    };
    setProducts(prev => [newItem, ...prev]);
    setForm({ name: '', price: '', unit: '원/개', emoji: '🥬' });
    setEmoji('🥬');
    showToast(`${newItem.emoji} ${newItem.name} 등록 완료!`);
  };

  // 상품 삭제
  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('상품이 삭제됐어요');
  };

  // 할인 저장
  const handleSaveDiscount = ({ saleStart, saleEnd, discountRate }) => {
    setProducts(prev => prev.map(p =>
      p.id === discountTarget.id ? { ...p, saleStart, saleEnd, discountRate } : p
    ));
    showToast(`${discountTarget.emoji} ${discountTarget.name} 할인 설정 완료!`);
  };

  // 통계
  const onSaleCount = products.filter(p => getSaleStatus(p, now) === 'active').length;
  const soonCount   = products.filter(p => getSaleStatus(p, now) === 'soon').length;

  return (
    <div className="shop-page">

      {/* ══ 헤더 ══ */}
      <header className="shop-header">
        <div className="shop-header-logo">
          <span>🏪</span> Pleege Market
        </div>
        <div className="shop-header-right">
          <span className="shop-header-name">{shopName}</span>
          <button className="shop-logout-btn" onClick={() => window.location.href = '/'}>
            로그아웃
          </button>
        </div>
      </header>

      {/* ══ 상점 정보 배너 ══ */}
      <div className="shop-info-banner">
        <div className="shop-info-left">
          <div className="shop-avatar">🏪</div>
          <div className="shop-info-text">
            <div className="shop-name">{shopName}</div>
            <div className="shop-meta">
              <div className="shop-status-badge open">
                <div className="shop-status-dot" />
                영업 중
              </div>
              <span>현재 시각: {now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>
        </div>
        <div className="shop-stats">
          <div className="shop-stat">
            <div className="shop-stat-num">{products.length}</div>
            <div className="shop-stat-label">등록 품목</div>
          </div>
          <div className="shop-stat">
            <div className="shop-stat-num" style={{ color: '#FF6B35' }}>{soonCount}</div>
            <div className="shop-stat-label">할인 임박</div>
          </div>
          <div className="shop-stat">
            <div className="shop-stat-num" style={{ color: '#E53535' }}>{onSaleCount}</div>
            <div className="shop-stat-label">할인 중</div>
          </div>
        </div>
      </div>

      {/* ══ 품목 등록 폼 ══ */}
      <div className="section-header">
        <div className="section-title">
          <span className="section-title-icon">➕</span>
          품목 등록
        </div>
      </div>

      <div className="item-add-card">
        <div className="item-add-title">새 품목을 등록하세요</div>

        {/* 이모지 선택 */}
        <div className="emoji-picker-wrap">
          <div className="item-form-label" style={{ fontFamily: "'Jua', sans-serif", fontSize: '0.82rem', color: '#5a4a32', marginBottom: 6 }}>
            품목 이미지 선택
          </div>
          <div className="emoji-grid">
            {EMOJI_LIST.map(e => (
              <button
                key={e}
                className={`emoji-btn ${selectedEmoji === e ? 'active' : ''}`}
                onClick={() => setEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* 폼 입력 */}
        <div className="item-form-grid">
          <div className="item-form-field">
            <label className="item-form-label">상품명</label>
            <input
              className="item-form-inp"
              type="text"
              placeholder="예) 시금치, 돼지고기"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleAddProduct()}
            />
          </div>

          <div className="item-form-field">
            <label className="item-form-label">단가 (원)</label>
            <input
              className="item-form-inp"
              type="number"
              placeholder="예) 3000"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleAddProduct()}
            />
          </div>

          <div className="item-form-field">
            <label className="item-form-label">단위</label>
            <select
              className="item-form-inp"
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })}
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {/* 미리보기 */}
          <div className="item-form-field" style={{ alignItems: 'center', justifyContent: 'center', background: 'rgba(255,248,238,0.6)', borderRadius: 12, border: '1.5px dashed rgba(255,107,53,0.2)', padding: '10px' }}>
            <div style={{ fontSize: '2.8rem', lineHeight: 1 }}>{selectedEmoji}</div>
            <div style={{ fontFamily: "'Jua', sans-serif", fontSize: '0.88rem', color: '#5a4a32', marginTop: 4 }}>
              {form.name || '상품명'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#8a7a60' }}>
              {form.price ? `${Number(form.price).toLocaleString()}${form.unit}` : '가격'}
            </div>
          </div>
        </div>

        <button className="item-add-btn" onClick={handleAddProduct}>
          품목 등록하기
        </button>
      </div>

      {/* ══ 등록된 품목 목록 ══ */}
      <div className="section-header">
        <div className="section-title">
          <span className="section-title-icon">📦</span>
          등록된 품목 ({products.length}개)
        </div>
      </div>

      <div className="items-section">
        <div className="product-grid">
          {products.length === 0 ? (
            <div className="product-empty">
              <span className="product-empty-icon">📦</span>
              <div className="product-empty-title">아직 등록된 품목이 없어요</div>
              <div className="product-empty-sub">위 폼에서 품목을 등록해보세요!</div>
            </div>
          ) : (
            products.map((item, idx) => (
              <ProductCard
                key={item.id}
                item={item}
                now={now}
                onDiscount={(p) => setDiscountTarget(p)}
                onDelete={handleDelete}
                style={{ animationDelay: `${idx * 0.06}s` }}
              />
            ))
          )}
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