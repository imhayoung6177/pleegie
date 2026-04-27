import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/market/ShopPage.css';
import '../../Styles/user/FridgePage.css';

// ✅ [연동 추가] marketService에서 API 함수 import
import { getMyMarket, getMarketItems, cancelSale } from '../../services/marketService';

/* ══════════════════════════════════════════════════════════
   상수 & 유틸
══════════════════════════════════════════════════════════ */

// ✅ [수정] 백엔드 saleStatus 값 기준으로 변경
// 이전: saleStart/saleEnd 시간 문자열로 계산
// 이후: 백엔드가 이미 계산해서 "NONE" | "UPCOMING" | "ON_SALE" 으로 줌
const getSaleStatus = (item) => {
  if (item.saleStatus === 'ON_SALE')  return 'active';
  if (item.saleStatus === 'UPCOMING') return 'soon';
  return 'none';
};

const getDisplayPrice = (item, status) => {
  if (status === 'active' && item.discountPrice) return item.discountPrice;
  return item.originalPrice;
};

/* ══════════════════════════════════════════════════════════
   할인 설정 모달
══════════════════════════════════════════════════════════ */
const DiscountModal = ({ item, onSave, onClose }) => {
  // ✅ [수정] 날짜+시간 형식으로 변경 (백엔드 LocalDateTime 형식)
  // 이전: "18:00" 시간만 입력
  // 이후: "2025-01-01T18:00" datetime-local 형식
  const today = new Date().toISOString().slice(0, 10);
  const [startTime, setStartTime] = useState(
    item.startTime ? item.startTime.slice(0, 16) : `${today}T18:00`
  );
  const [endTime, setEndTime] = useState(
    item.endTime   ? item.endTime.slice(0, 16)   : `${today}T20:00`
  );
  const [discountPrice, setDiscountPrice] = useState(
    item.discountPrice || item.originalPrice || 0
  );

  const currentRate = item.originalPrice && discountPrice
    ? Math.round((1 - discountPrice / item.originalPrice) * 100)
    : 0;
  const PRESETS = [10, 20, 30, 50, 70];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="discount-modal" onClick={e => e.stopPropagation()}>
        <div className="discount-modal-top">
          <span className="discount-modal-emoji">🏷️</span>
          <span className="discount-modal-name">{item.name} 할인 설정</span>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="discount-form">
          <div className="discount-field">
            <label className="discount-label">할인가 (원)</label>
            <input
              className="discount-inp"
              type="number"
              value={discountPrice}
              onChange={e => setDiscountPrice(Number(e.target.value))}
            />
            <div className="discount-presets">
              {PRESETS.map(p => (
                <button
                  key={p}
                  className={`discount-preset-btn ${currentRate === p ? 'active' : ''}`}
                  onClick={() => setDiscountPrice(Math.round(item.originalPrice * (1 - p / 100)))}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          {/* ✅ [수정] type="time" → type="datetime-local"
              이전: 시간만 입력 ("18:00")
              이후: 날짜+시간 입력 → 백엔드 LocalDateTime 형식에 맞춤 */}
          <div className="discount-field">
            <label className="discount-label">할인 시작 일시</label>
            <input
              className="discount-inp"
              type="datetime-local"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
            />
          </div>

          <div className="discount-field">
            <label className="discount-label">할인 종료 일시</label>
            <input
              className="discount-inp"
              type="datetime-local"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
            />
          </div>

          <div className="discount-preview">
            <span className="discount-preview-label">할인 적용 가격</span>
            <div className="discount-preview-price">
              <span className="original-price">{item.originalPrice?.toLocaleString()}원</span>
              <span className="sale-price">{discountPrice.toLocaleString()}원</span>
            </div>
          </div>

          <button
            className="modal-submit-btn"
            onClick={() => {
              onSave({
                discountPrice,
                discountRate: currentRate,
                // ✅ [연동] 백엔드 LocalDateTime 형식으로 변환
                // "2025-01-01T18:00" → "2025-01-01T18:00:00"
                startTime: startTime + ':00',
                endTime:   endTime   + ':00',
              });
              onClose();
            }}
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
const ProductCard = ({ item, now, onDelete, onDiscount }) => {
  const status       = getSaleStatus(item);
  const displayPrice = getDisplayPrice(item, status);

  return (
    <div className={`product-card ${status === 'soon' ? 'sale-soon' : ''} ${status === 'active' ? 'on-sale' : ''}`}>
      <div className="product-emoji-wrap">
        🛒
        {status === 'soon'   && <span className="sale-badge soon-badge">⏰ 임박</span>}
        {status === 'active' && <span className="sale-badge active-badge">🔴 할인 중</span>}
      </div>

      <div className="product-name">{item.name}</div>

      <div className="product-price-wrap">
        {status === 'active' && (
          <span className="product-original-price">
            {item.originalPrice?.toLocaleString()}원/{item.unit || '개'}
          </span>
        )}
        <span className={`product-price ${status === 'active' ? 'discounted' : ''}`}>
          {displayPrice?.toLocaleString()}원/{item.unit || '개'}
        </span>
        {/* ✅ [연동] 할인 시간 표시 - 백엔드 startTime/endTime 사용 */}
        {item.startTime && (
          <span style={{ fontSize: '0.72rem', color: '#FF6B35' }}>
            {item.startTime.slice(11, 16)}~{item.endTime?.slice(11, 16)} 할인
          </span>
        )}
      </div>

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

  // ✅ [수정] localStorage → DB API 로 교체
  // 이전: localStorage.getItem('shopName')
  // 이후: GET /market/mypage 로 시장 정보 조회
  const [marketInfo, setMarketInfo] = useState(null);
  const [products,   setProducts]   = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState('');

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [discountTarget, setDiscountTarget] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // ✅ [연동 추가] 페이지 진입 시 시장 정보 + 품목 목록 API 호출
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. 내 시장 정보 조회 → GET /market/mypage
        const market = await getMyMarket();
        setMarketInfo(market);

        // 2. 품목 목록 조회 → GET /market/items
        const items = await getMarketItems();
        setProducts(items || []);

      } catch (err) {
        // ✅ 토큰 만료 시 로그인 페이지로 이동
        if (err.message === '로그인이 필요합니다') {
          navigate('/market/login');
          return;
        }
        setError(err.message || '데이터를 불러오는데 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // ✅ [연동] 품목 삭제 → DELETE /market/items/{itemId}
  const handleDelete = async (itemId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const { deleteMarketItem } = await import('../../services/marketService');
      await deleteMarketItem(itemId);
      // 목록에서 제거
      setProducts(prev => prev.filter(p => p.id !== itemId));
      showToast('품목이 삭제됐어요');
    } catch (err) {
      showToast(err.message || '삭제에 실패했습니다');
    }
  };

  // ✅ [연동] 할인 저장 → POST /market/items/{itemId}/sale
  const handleSaveDiscount = async ({ discountPrice, discountRate, startTime, endTime }) => {
    try {
      const { startSale } = await import('../../services/marketService');
      const updated = await startSale(discountTarget.id, {
        discountPrice,
        discountRate,
        startTime,
        endTime,
      });
      // 목록 업데이트
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      showToast(`${discountTarget.name} 할인 설정 완료!`);
    } catch (err) {
      showToast(err.message || '할인 설정에 실패했습니다');
    }
  };

  // ✅ [연동] 할인 취소 → DELETE /market/items/{itemId}/sale
  const handleCancelSale = async (itemId) => {
    try {
      const updated = await cancelSale(itemId);
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      showToast('할인이 취소되었습니다');
    } catch (err) {
      showToast(err.message || '할인 취소에 실패했습니다');
    }
  };

  const onSaleCount = products.filter(p => p.saleStatus === 'ON_SALE').length;
  const soonCount   = products.filter(p => p.saleStatus === 'UPCOMING').length;

  // ✅ [연동] 시장 이름: marketInfo.name (DB) 우선, 없으면 localStorage 폴백
  const shopName = marketInfo?.name || localStorage.getItem('shopName') || '내 가게';

  if (isLoading) return (
    <div className="fridge-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center', color: '#8a7a60' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏪</div>
        <div>시장 정보를 불러오는 중...</div>
      </div>
    </div>
  );

  return (
    <div className="fridge-page">
      {/* ══ 헤더 ══ */}
      <div className="page-header">
        <h1 className="page-title">pleegie</h1>
        <div className="header-actions">
          <button className="header-user-btn" onClick={() => navigate('/market/mypage')}>
            <span className="header-user-emoji">🏪</span>
            {/* ✅ [수정] localStorage → marketInfo.name (DB 값) */}
            <span className="header-user-name">{shopName}</span>
          </button>
          <button className="header-logout-btn" onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}>
            로그아웃
          </button>
        </div>
      </div>

      <div className="fridge-outer">
        <div className="fridge-top-panel">
          {/* ✅ [수정] localStorage → DB에서 받은 시장 이름 표시 */}
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
            <span>할인 임박: <span style={{ color: '#FF6B35' }}>{soonCount}</span>건</span>
            <span>할인 중: <span style={{ color: '#E53535' }}>{onSaleCount}</span>건</span>
          </div>
        </div>

        <div className="fridge-divider" />

        <div className="fridge-interior">
          <div className="fridge-ceiling-light" />
          <div className="product-grid" style={{ padding: '0 16px 20px', position: 'relative', zIndex: 2 }}>

            {/* ✅ [수정] 에러 표시 */}
            {error && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#E53535', padding: '20px' }}>
                ⚠️ {error}
              </div>
            )}

            {/* ✅ [수정] 품목 없을 때 "재료 등록하기" 버튼 강조 표시 */}
            {!error && products.length === 0 ? (
              <div className="fridge-empty" style={{ gridColumn: '1 / -1' }}>
                <span className="empty-icon">📦</span>
                <div className="empty-title">등록된 품목이 없어요</div>
                <div className="empty-sub">아래 버튼을 눌러 첫 품목을 등록해보세요!</div>
                {/* ✅ [추가] 품목 없을 때 등록 버튼 강조 */}
                <button
                  onClick={() => navigate('/market/items')}
                  style={{
                    marginTop: '16px',
                    padding: '12px 28px',
                    background: '#FF6B35',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  📦 재료 등록하러 가기
                </button>
              </div>
            ) : (
              products.map(item => (
                <ProductCard
                  key={item.id}
                  item={item}
                  now={now}
                  onDiscount={p => setDiscountTarget(p)}
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

      {toast && <div className="shop-toast">{toast}</div>}
    </div>
  );
}