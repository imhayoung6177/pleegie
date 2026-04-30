import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../../Styles/market/MarketMyPage.css';
import ShopProfileEdit from './ShopProfileEdit';
import { QRCodeCanvas } from 'qrcode.react';
import { getMyMarket, getMarketItems, cancelSale, reissueQrCode } from '../../services/marketService';
import pleegemarket from "../../assets/pleegemarket.png";

const MG  = "#B7CCAC";
const MGD = "#8fa882";
const MT  = "#2a1f0e";

const BG_LAYER = {
  position: "fixed",
  top: 0, left: 0,
  width: "100%", height: "100%",
  backgroundImage: `url(${pleegemarket})`,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  zIndex: 0,
};

const MENU = [
  { id: 'shopprofile', emoji: '✏️', label: '상인정보 수정',  desc: '상호명·연락처·주소·비밀번호 변경' },
  { id: 'qr',          emoji: '📱', label: 'QR 코드',        desc: '내 가게 QR코드 확인하기' },
  { id: 'items_page',  emoji: '📦', label: '품목 등록/조회', desc: '새 품목 등록 및 등록된 품목 관리' },
  { id: 'discount',    emoji: '🏷️', label: '할인 관리',      desc: '할인 등록 및 취소' },
];

const fmtTime = (t) => {
  if (!t) return '';
  const d = new Date(t);
  if (isNaN(d.getTime())) return t.slice(0, 5);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${mm}/${dd} ${hh}:${min}`;
};

const getSaleStatus = (item) => {
  if (item.saleStatus === 'ON_SALE')  return 'active';
  if (item.saleStatus === 'UPCOMING') return 'soon';
  return 'none';
};

/* ── 서브페이지 공통 카드 래퍼 ── */
const PageCard = ({ emoji, title, onBack, children }) => (
  <div style={{ position: "relative" }}>
    <div style={BG_LAYER} />
    <div style={{ position: "relative", zIndex: 1, minHeight: "calc(100vh - 88px)", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 20px", boxSizing: "border-box" }}>
      <div className="mmp-white-box" style={{ width: '100%', maxWidth: '600px', background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', flex: 1 }}>
        <div className="mmp-logo" style={{ color: 'black' }}>pleegie</div>
        <div style={{ textAlign: 'center', marginBottom: '24px', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: '#2a1f0e', margin: '0 0 4px', fontWeight: 700 }}>{emoji} {title}</h2>
        </div>
        <div style={{ width: '100%' }}>{children}</div>
        <div style={{ marginTop: 'auto', flexShrink: 0 }}>
          <div className="mmp-back-divider"><span>다른 메뉴로 이동할까요?</span></div>
          <button className="mmp-back-link-btn" style={{ color: MG, borderColor: MG, background: 'rgba(183,204,172,0.06)' }} onClick={onBack}>
            마이페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ── QR 섹션 ── */
const QRSection = ({ marketInfo, onReissue }) => {
  const [isReissuing, setIsReissuing] = useState(false);
  // window.location.origin을 사용하여 현재 접속 환경의 URL을 자동으로 반영합니다.
  // 하드코딩된 IP(예: 192.168.0.x)를 사용하면 다른 기기나 환경에서 QR이 동작하지 않습니다.
  const qrValue = `${window.location.origin}/market/scan/${marketInfo?.id}`;

  const handleSave = () => {
    const canvas = document.querySelector('#qr-canvas canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${marketInfo?.name || '가게'}_QR.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleReissue = async () => {
    if (!window.confirm('QR 코드를 재발급하면 기존 QR은 사용할 수 없어요. 진행할까요?')) return;
    setIsReissuing(true);
    try { await reissueQrCode(); alert('QR 코드가 재발급되었습니다!'); onReissue?.(); }
    catch (err) { alert(err.message || 'QR 재발급 실패'); }
    finally { setIsReissuing(false); }
  };

  if (marketInfo?.status === 'PENDING') return (
    <div className="mmp-empty"><span>⏳</span><p>관리자 승인 후<br />QR 코드를 사용할 수 있어요</p></div>
  );

  return (
    <div className="mmp-qr-wrap">
      <p className="mmp-qr-desc">고객이 이 QR코드를 스캔하면<br />내 가게 정보를 바로 확인할 수 있어요</p>
      <div className="mmp-qr-box" id="qr-canvas">
        <QRCodeCanvas value={qrValue} size={200} bgColor="#ffffff" fgColor="#2a1f0e" level="M" />
      </div>
      <div className="mmp-qr-shop">{marketInfo?.name}</div>
      <div style={{ fontSize: '0.72rem', color: '#8a7a60', wordBreak: 'break-all', textAlign: 'center', marginTop: '4px' }}>{qrValue}</div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', width: '100%' }}>
        <button className="mmp-primary-btn" style={{ flex: 1, background: MG, color: MT }} onClick={handleSave}>📥 QR 코드 저장</button>
        <button className="mmp-primary-btn" style={{ flex: 1, background: MGD, color: 'white' }} onClick={handleReissue} disabled={isReissuing}>
          {isReissuing ? '재발급 중...' : '🔄 재발급'}
        </button>
      </div>
    </div>
  );
};

/* ── 할인 관리 섹션 ── */
const DiscountSection = ({ products, onRefresh }) => {
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(null);

  if (products.length === 0) return (
    <div className="mmp-empty"><span>🏷️</span><p>등록된 품목이 없어요<br />품목을 먼저 등록해주세요!</p></div>
  );

  const handleCancel = async (itemId) => {
    if (!window.confirm('할인을 취소하시겠습니까?')) return;
    setCancelling(itemId);
    try { await cancelSale(itemId); onRefresh?.(); }
    catch (err) { alert(err.message || '할인 취소 실패'); }
    finally { setCancelling(null); }
  };

  return (
    <div className="mmp-product-list">
      {products.map(item => {
        const status      = getSaleStatus(item);
        const hasDiscount = item.saleStatus !== 'NONE' && item.discountPrice;
        return (
          <div key={item.id} className="mmp-product-row">
            <div className="mmp-product-row-info">
              <span className="mmp-product-row-name">{item.name}</span>
              <span className="mmp-product-row-price">{item.originalPrice?.toLocaleString()}원</span>
              {hasDiscount && item.startTime && (
                <span style={{ fontSize: '0.76rem', color: '#FF6B35', display: 'block' }}>
                  {fmtTime(item.startTime)} ~ {fmtTime(item.endTime)}<br />
                  {item.discountRate}% 할인 · {item.discountPrice?.toLocaleString()}원
                </span>
              )}
              {status === 'active' && <span className="mmp-badge-active">🔴 할인 중</span>}
              {status === 'soon'   && <span className="mmp-badge-soon">⏰ 할인 임박</span>}
            </div>
            <div className="mmp-product-row-btns">
              <button className="mmp-edit-btn" style={{ background: MG, color: MT, border: 'none' }}
                onClick={() => navigate(`/market/items/${item.id}/sale`)}>
                {hasDiscount ? '수정' : '등록'}
              </button>
              {hasDiscount && (
                <button className="mmp-delete-btn" onClick={() => handleCancel(item.id)} disabled={cancelling === item.id}>
                  {cancelling === item.id ? '취소 중...' : '취소'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── 메인 MarketMyPage ── */
export default function MarketMyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'main';
  const [shopInfo,  setShopInfo]  = useState(null);
  const [products,  setProducts]  = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const [market, itemList] = await Promise.all([getMyMarket(), getMarketItems()]);
        if (cancelled) return;
        setShopInfo(market);
        setProducts(itemList || []);
        if (market?.name) localStorage.setItem('shopName', market.name);
      } catch (err) {
        if (!cancelled && err.message === '로그인이 필요합니다') navigate('/market/login');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [navigate, refreshKey]);

  // 만료된 할인 자동 취소
  useEffect(() => {
    if (products.length === 0) return;

    const now = Date.now();
    const expired = products.filter(p =>
      p.saleStatus !== 'NONE' && p.endTime && new Date(p.endTime).getTime() < now
    );

    if (expired.length > 0) {
      Promise.all(expired.map(p => cancelSale(p.id).catch(() => {})))
        .then(() => triggerRefresh());
      return;
    }

    // 다음 만료 시각에 맞춰 자동 갱신 타이머 설정
    const nextExpiry = products
      .filter(p => p.saleStatus !== 'NONE' && p.endTime)
      .map(p => new Date(p.endTime).getTime())
      .filter(t => t > now)
      .sort((a, b) => a - b)[0];

    if (!nextExpiry) return;
    const timer = setTimeout(() => triggerRefresh(), nextExpiry - now + 500);
    return () => clearTimeout(timer);
  }, [products]);

  const setActiveTab = (tab) => setSearchParams(tab === 'main' ? {} : { tab });
  const goBack = () => setActiveTab('main');
  const onSaleCount = products.filter(p => p.saleStatus === 'ON_SALE').length;
  const soonCount   = products.filter(p => p.saleStatus === 'UPCOMING').length;
  const shopName    = shopInfo?.name || localStorage.getItem('shopName') || '내 가게';

  if (isLoading) return (
    <div style={{ position: "relative" }}>
      <div style={BG_LAYER} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.88)', padding: '32px', borderRadius: '16px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏪</div>
          <div>정보를 불러오는 중...</div>
        </div>
      </div>
    </div>
  );

  if (activeTab === 'shopprofile') return (
    <ShopProfileEdit
      shopInfo={{ shopId: shopInfo?.id, bizNumber: shopInfo?.businessNumber, shopName: shopInfo?.name, ownerName: shopInfo?.ceoName, phone: shopInfo?.phone }}
      onBack={goBack} onSave={(u) => setShopInfo(p => ({ ...p, ...u }))} />
  );
  if (activeTab === 'qr')       return <PageCard emoji="📱" title="QR 코드"  onBack={goBack}><QRSection marketInfo={shopInfo} onReissue={triggerRefresh} /></PageCard>;
  if (activeTab === 'discount') return <PageCard emoji="🏷️" title="할인 관리" onBack={goBack}><DiscountSection products={products} onRefresh={triggerRefresh} /></PageCard>;

  return (
    <div style={{ position: "relative" }}>
      {/* ✅ 배경 레이어 */}
      <div style={BG_LAYER} />

      {/* 콘텐츠 레이어 */}
      <div className="mmp-page" style={{ position: "relative", zIndex: 1, background: "transparent" }}>

        <div className="mmp-header" style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(10px)' }}>
          <button className="mmp-back-btn" onClick={() => navigate('/market/main')}>← 돌아가기</button>
          <span className="mmp-header-title">마이페이지</span>
          <div style={{ width: 90 }} />
        </div>

        <div className="mmp-profile-card" style={{ background: 'rgba(255,255,255,0.92)' }}>
          <div className="mmp-avatar">🏪</div>
          <div className="mmp-profile-info">
            <div className="mmp-shop-name">{shopName}</div>
            <div className="mmp-role-row">
              <div className="mmp-role-badge">
                {shopInfo?.status === 'APPROVED'  && '✅ 승인완료'}
                {shopInfo?.status === 'PENDING'   && '⏳ 승인대기'}
                {shopInfo?.status === 'SUSPENDED' && '🚫 이용정지'}
                {!shopInfo?.status && '소상공인'}
              </div>
              <button className="mmp-logout-btn" onClick={() => setLogoutOpen(true)}>로그아웃</button>
            </div>
            <div className="mmp-stats-row">
              <div className="mmp-stat-item"><span className="mmp-stat-num">{products.length}</span><span className="mmp-stat-label">등록 품목</span></div>
              <div className="mmp-stat-divider" />
              <div className="mmp-stat-item"><span className="mmp-stat-num" style={{ color: '#FF6B35' }}>{soonCount}</span><span className="mmp-stat-label">할인 임박</span></div>
              <div className="mmp-stat-divider" />
              <div className="mmp-stat-item"><span className="mmp-stat-num" style={{ color: '#E53535' }}>{onSaleCount}</span><span className="mmp-stat-label">할인 중</span></div>
            </div>
          </div>
        </div>

        <div className="mmp-menu-list">
          {MENU.map((item, i) => (
            <button key={item.id} className="mmp-menu-item"
              style={{ animationDelay: `${i * 0.06}s`, background: 'rgba(255,255,255,0.88)' }}
              onClick={() => { if (item.id === 'items_page') navigate('/market/items'); else setActiveTab(item.id); }}>
              <span className="mmp-item-emoji">{item.emoji}</span>
              <div className="mmp-item-text">
                <strong className="mmp-item-label">{item.label}</strong>
                <span className="mmp-item-desc">{item.desc}</span>
              </div>
              <span className="mmp-item-arrow">›</span>
            </button>
          ))}
        </div>

        {/* 로그아웃 모달 */}
        {logoutOpen && (
          <div className="mmp-modal-overlay" onClick={() => setLogoutOpen(false)}>
            <div className="mmp-modal" onClick={e => e.stopPropagation()}>
              <div className="mmp-modal-icon">🚪</div>
              <div className="mmp-modal-title">로그아웃 하시겠어요?</div>
              <div className="mmp-modal-desc">{shopName} 계정에서<br />로그아웃됩니다.</div>
              <div className="mmp-modal-btns">
                <button className="mmp-modal-cancel" onClick={() => setLogoutOpen(false)}>취소</button>
                <button className="mmp-modal-confirm" style={{ background: MG, color: MT }}
                  onClick={() => { localStorage.clear(); navigate('/'); }}>
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}