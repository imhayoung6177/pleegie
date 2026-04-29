import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/market/ShopPage.css';
import '../../Styles/user/FridgePage.css';
import pleegemarket from "../../assets/pleegemarket.png";
import { getMyMarket, getMarketItems, cancelSale } from '../../services/marketService';

const MG  = "#B7CCAC";
const MGD = "#8fa882";
const MT  = "#2a1f0e";

const BG_LAYER = {
  position: "fixed",
  top: 0, left: 0,
  width: "100%", height: "100%",
  backgroundImage: `url(${pleegemarket})`,
  backgroundSize: "100% 100%",    /* ✅ 잘림 없이 전체화면 */
  backgroundRepeat: "no-repeat",
  zIndex: 0,
};

const getSaleStatus = (item) => {
  if (item.saleStatus === 'ON_SALE')  return 'active';
  if (item.saleStatus === 'UPCOMING') return 'soon';
  return 'none';
};

/* ── 할인 설정 모달 ── */
const DiscountModal = ({ item, onSave, onClose }) => {
  // 할인이 활성 상태일 때만 기존 값을 채움
  // endSale() 후 백엔드가 startTime/endTime을 지우지 않으므로 saleStatus로 판단해야 함
  const hasActiveSale = item.saleStatus !== 'NONE';
  const [startTime, setStartTime] = useState(hasActiveSale && item.startTime ? item.startTime.slice(0,16) : '');
  const [endTime,   setEndTime]   = useState(hasActiveSale && item.endTime   ? item.endTime.slice(0,16)   : '');
  const [discountPrice, setDiscountPrice] = useState(hasActiveSale && item.discountPrice ? item.discountPrice : '');
  const dpNum = Number(discountPrice) || 0;
  const currentRate = item.originalPrice && dpNum ? Math.round((1 - dpNum / item.originalPrice) * 100) : 0;
  const PRESETS = [10, 20, 30, 50, 70];

  const handleSave = () => {
    if (!dpNum || dpNum <= 0) { alert('할인가를 입력해주세요.'); return; }
    if (!startTime || !endTime) { alert('할인 시작/종료 일시를 입력해주세요.'); return; }
    if (new Date(endTime) <= new Date(startTime)) { alert('종료 일시는 시작 일시보다 늦어야 합니다.'); return; }
    onSave({ discountPrice: dpNum, discountRate: currentRate, startTime: startTime + ':00', endTime: endTime + ':00' });
    onClose();
  };

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
            <input className="discount-inp" type="number" placeholder="할인 가격 입력" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} />
            <div className="discount-presets">
              {PRESETS.map(p => (
                <button key={p} className={`discount-preset-btn ${currentRate === p ? 'active' : ''}`}
                  style={currentRate === p ? { background: MG, borderColor: MG, color: MT } : {}}
                  onClick={() => setDiscountPrice(Math.round(item.originalPrice * (1 - p / 100)))}>{p}%</button>
              ))}
            </div>
          </div>
          <div className="discount-field">
            <label className="discount-label">할인 시작 일시</label>
            <input className="discount-inp" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
          <div className="discount-field">
            <label className="discount-label">할인 종료 일시</label>
            <input className="discount-inp" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
          {dpNum > 0 && (
            <div className="discount-preview">
              <span className="discount-preview-label">할인 적용 가격</span>
              <div className="discount-preview-price">
                <span className="original-price">{item.originalPrice?.toLocaleString()}원</span>
                <span className="sale-price">{dpNum.toLocaleString()}원</span>
              </div>
            </div>
          )}
          <button className="modal-submit-btn"
            style={{ background: MG, color: MT }}
            onClick={handleSave}>
            할인 설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── 상품 카드 ── */
const ProductCard = ({ item, onDelete, onDiscount }) => {
  const status = getSaleStatus(item);
  const displayPrice = status === 'active' && item.discountPrice ? item.discountPrice : item.originalPrice;
  return (
    <div className={`product-card ${status === 'soon' ? 'sale-soon' : ''} ${status === 'active' ? 'on-sale' : ''}`}
      style={{ background: 'rgba(255,255,255,0.92)' }}>
      <div className="product-emoji-wrap">
        🛒
        {status === 'soon'   && <span className="sale-badge soon-badge">⏰ 임박</span>}
        {status === 'active' && <span className="sale-badge active-badge">🔴 할인 중</span>}
      </div>
      <div className="product-name">{item.name}</div>
      <div className="product-price-wrap">
        {status === 'active' && <span className="product-original-price">{item.originalPrice?.toLocaleString()}원/{item.unit || '개'}</span>}
        <span className={`product-price ${status === 'active' ? 'discounted' : ''}`}>{displayPrice?.toLocaleString()}원/{item.unit || '개'}</span>
        {/* saleStatus가 NONE이면 endSale() 후 startTime이 남아있어도 표시하지 않음 */}
        {item.saleStatus !== 'NONE' && item.startTime && (
          <span style={{ fontSize: '0.72rem', color: '#FF6B35' }}>
            {item.startTime.slice(11,16)}~{item.endTime?.slice(11,16)} 할인
          </span>
        )}
      </div>
      <div className="product-card-btns">
        <button className="product-edit-btn" style={{ background: 'rgba(183,204,172,0.2)', borderColor: MG, color: MT }} onClick={() => onDiscount(item)}>할인 설정</button>
        <button className="product-delete-btn" onClick={() => onDelete(item.id)}>삭제</button>
      </div>
    </div>
  );
};

export default function ShopPage() {
  const navigate = useNavigate();
  const [marketInfo, setMarketInfo] = useState(null);
  const [products,   setProducts]   = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState('');
  const [discountTarget, setDiscountTarget] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const market = await getMyMarket();
        setMarketInfo(market);
        if (market?.name) localStorage.setItem('shopName', market.name);
        setProducts((await getMarketItems()) || []);
      } catch (err) {
        if (err.message === '로그인이 필요합니다') { navigate('/market/login'); return; }
        setError(err.message || '데이터를 불러오는데 실패했습니다');
      } finally { setIsLoading(false); }
    })();
  }, [navigate]);

  const handleDelete = async (itemId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const { deleteMarketItem } = await import('../../services/marketService');
      await deleteMarketItem(itemId);
      setProducts(p => p.filter(x => x.id !== itemId));
      showToast('품목이 삭제됐어요');
    } catch (err) { showToast(err.message || '삭제 실패'); }
  };

  const handleSaveDiscount = async (data) => {
    try {
      const { startSale } = await import('../../services/marketService');
      const updated = await startSale(discountTarget.id, data);
      setProducts(p => p.map(x => x.id === updated.id ? updated : x));
      showToast(`${discountTarget.name} 할인 설정 완료!`);
    } catch (err) { showToast(err.message || '할인 설정 실패'); }
  };

  const onSaleCount = products.filter(p => p.saleStatus === 'ON_SALE').length;
  const soonCount   = products.filter(p => p.saleStatus === 'UPCOMING').length;
  const shopName    = marketInfo?.name || localStorage.getItem('shopName') || '내 가게';

  if (isLoading) return (
    <div style={{ position: "relative" }}>
      <div style={BG_LAYER} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.88)', padding: '32px', borderRadius: '16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏪</div>
          <div>시장 정보를 불러오는 중...</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      {/* ✅ 배경 레이어 - 항상 전체화면 */}
      <div style={BG_LAYER} />

      {/* 콘텐츠 레이어 */}
      <div style={{ position: "relative", zIndex: 1, minHeight: "calc(100vh - 88px)", display: "flex", flexDirection: "column" }}>

        {/* 헤더 */}
        <div className="page-header" style={{ background: 'transparent', position: 'sticky', top: 0, zIndex: 50 }}>
          <h1
          className="page-title"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          pleegie
        </h1>
          <div className="header-actions">
            <button className="header-user-btn" style={{ display: 'flex', alignItems: 'center', height: '36px', boxSizing: 'border-box', background: MG, color: MT, fontWeight: 'bold', border: '2px solid #2a1f0e', borderRadius: '12px', padding: '0 14px', fontSize: '0.95rem', fontFamily: 'var(--font-title)', cursor: 'pointer' }} onClick={() => navigate('/market/mypage')}>
             {shopName}
            </button>
            <button className="header-logout-btn" style={{ display: 'flex', alignItems: 'center', height: '36px', boxSizing: 'border-box', background: MG, color: MT, fontWeight: 'bold', border: '2px solid #2a1f0e', borderRadius: '12px', padding: '0 14px', fontSize: '0.95rem', fontFamily: 'var(--font-title)', cursor: 'pointer' }} onClick={() => { localStorage.clear(); window.location.href = '/'; }}>
              로그아웃
            </button>
          </div>
        </div>

        <div className="fridge-outer" style={{ flex: 1 }}>
          <div className="fridge-top-panel" style={{ background: 'rgba(255,255,255,0.65)' }}>
            <span className="fridge-brand" onClick={() => navigate('/market/mypage')} style={{ cursor: 'pointer' }}>{shopName}</span>
          </div>

          <div className="fridge-ai-bar" style={{ background: 'rgba(255,255,255,0.6)' }}>
            {/* ✅ 재료 등록하기 버튼 → #B7CCAC */}
            <button onClick={() => navigate('/market/items')}
              style={{ background: MG, color: MT, border: 'none', boxShadow: 'none', padding: '10px 20px', borderRadius: '12px', fontFamily: 'var(--font-title)', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
              <strong>재료 등록하기</strong>
            </button>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: '#3a2e1e', fontWeight: 'bold' }}>
              <span>할인 임박: <span style={{ color: '#FF6B35' }}>{soonCount}</span>건</span>
              <span>할인 중: <span style={{ color: '#E53535' }}>{onSaleCount}</span>건</span>
            </div>
          </div>

          <div className="fridge-divider" />

          <div className="fridge-interior" style={{ background: 'rgba(255,255,255,0.5)' }}>
            <div className="fridge-ceiling-light" />
            <div className="product-grid" style={{ padding: '0 16px 20px', position: 'relative', zIndex: 2 }}>
              {error && <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#E53535', padding: '20px' }}>⚠️ {error}</div>}
              {!error && products.length === 0 ? (
                <div className="fridge-empty" style={{ gridColumn: '1 / -1' }}>
                  <span className="empty-icon">📦</span>
                  <div className="empty-title">등록된 품목이 없어요</div>
                  <div className="empty-sub">아래 버튼을 눌러 첫 품목을 등록해보세요!</div>
                  <button onClick={() => navigate('/market/items')}
                    style={{ marginTop: '16px', padding: '12px 28px', background: MG, color: MT, border: 'none', boxShadow: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                    📦 재료 등록하러 가기
                  </button>
                </div>
              ) : (
                products.map(item => <ProductCard key={item.id} item={item} onDiscount={p => setDiscountTarget(p)} onDelete={handleDelete} />)
              )}
            </div>
          </div>

          <div className="fridge-bottom" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <span className="item-count">등록된 품목 {products.length}개</span>
          </div>
        </div>
      </div>

      {discountTarget && <DiscountModal item={discountTarget} onSave={handleSaveDiscount} onClose={() => setDiscountTarget(null)} />}
      {toast && <div className="shop-toast">{toast}</div>}
    </div>
  );
}