import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../../Styles/market/MarketMyPage.css';
import ShopProfileEdit from './ShopProfileEdit';

// ✅ [연동 추가] qrcode.react 라이브러리 import
// → npm install qrcode.react 설치 후 사용 가능
import { QRCodeCanvas } from 'qrcode.react';

// ✅ [연동 추가] marketService API 함수 import
import {
  getMyMarket,
  getMarketItems,
  cancelSale,
  reissueQrCode,
} from '../../services/marketService';

/* ══════════════════════════════════════════════════════════
   상수 & 유틸
══════════════════════════════════════════════════════════ */
const MENU = [
  { id: 'shopprofile', emoji: '✏️', label: '상인정보 수정',  desc: '상호명·연락처·주소·비밀번호 변경' },
  { id: 'qr',          emoji: '📱', label: 'QR 코드',        desc: '내 가게 QR코드 확인하기' },
  { id: 'items_page',  emoji: '📦', label: '품목 등록/조회', desc: '새 품목 등록 및 등록된 품목 관리' },
  { id: 'discount',    emoji: '🏷️', label: '할인 관리',      desc: '할인 등록 및 취소' },
];

// ✅ [수정] 백엔드 saleStatus 기준으로 변경
// 이전: saleStart/saleEnd 시간 문자열로 직접 계산
// 이후: 백엔드 SaleScheduler가 계산한 saleStatus 사용
const getSaleStatus = (item) => {
  if (item.saleStatus === 'ON_SALE')  return 'active';
  if (item.saleStatus === 'UPCOMING') return 'soon';
  return 'none';
};

/* ══════════════════════════════════════════════════════════
   PageCard 래퍼
══════════════════════════════════════════════════════════ */
const PageCard = ({ emoji, title, onBack, children }) => (
  <div className="mmp-subpage">
    <div className="mmp-white-box">
      <div className="mmp-logo">pleegie</div>
      <div style={{ textAlign: 'center', marginBottom: '24px', flexShrink: 0 }}>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: '#2a1f0e', margin: '0 0 4px', fontWeight: 700 }}>
          {emoji} {title}
        </h2>
      </div>
      <div style={{ width: '100%' }}>{children}</div>
      <div style={{ marginTop: 'auto', flexShrink: 0 }}>
        <div className="mmp-back-divider"><span>다른 메뉴로 이동할까요?</span></div>
        <button className="mmp-back-link-btn" onClick={onBack}>
          마이페이지로 돌아가기
        </button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   QR 코드 섹션
   ✅ [전면 수정] 가짜 Canvas QR → 실제 QRCodeCanvas 사용
══════════════════════════════════════════════════════════ */
const QRSection = ({ marketInfo, onReissue }) => {

  const [isReissuing, setIsReissuing] = useState(false);

  // ✅ QR에 담을 URL
  // → 고객이 스캔하면 해당 시장 페이지로 이동
  // → qrToken 기반 URL 사용 (보안상 안전)
  const qrValue = `http://192.168.0.16:5173/market/scan/${marketInfo?.id}`;;


  // ✅ QR 이미지 저장
  const handleSave = () => {
    // id="qr-canvas" 안의 canvas 엘리먼트를 찾아서 PNG로 다운로드
    const canvas = document.querySelector('#qr-canvas canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${marketInfo?.name || '가게'}_QR.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // ✅ [연동] QR 재발급 → PUT /market/qr
  const handleReissue = async () => {
    if (!window.confirm('QR 코드를 재발급하면 기존 QR은 사용할 수 없어요. 진행할까요?')) return;
    setIsReissuing(true);
    try {
      await reissueQrCode();
      alert('QR 코드가 재발급되었습니다!');
      // 부모에게 갱신 요청
      onReissue && onReissue();
    } catch (err) {
      alert(err.message || 'QR 재발급에 실패했습니다');
    } finally {
      setIsReissuing(false);
    }
  };

  // ✅ 시장이 미승인 상태일 때 안내
  if (marketInfo?.status === 'PENDING') {
    return (
      <div className="mmp-empty">
        <span>⏳</span>
        <p>관리자 승인 후<br />QR 코드를 사용할 수 있어요</p>
      </div>
    );
  }

  return (
    <div className="mmp-qr-wrap">
      <p className="mmp-qr-desc">
        고객이 이 QR코드를 스캔하면<br />내 가게 정보를 바로 확인할 수 있어요
      </p>

      {/* ✅ [수정] 가짜 Canvas → 실제 QRCodeCanvas */}
      <div className="mmp-qr-box" id="qr-canvas">
        <QRCodeCanvas
          value={qrValue}
          size={200}
          bgColor="#ffffff"
          fgColor="#2a1f0e"
          level="M"   // 오류 복원 수준 (L/M/Q/H)
        />
      </div>

      {/* ✅ [수정] DB에서 받은 시장 이름 표시 */}
      <div className="mmp-qr-shop">{marketInfo?.name}</div>
      <div className="mmp-qr-url" style={{ fontSize: '0.72rem', color: '#8a7a60', wordBreak: 'break-all', textAlign: 'center', marginTop: '4px' }}>
        {qrValue}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', width: '100%' }}>
        {/* QR 저장 버튼 */}
        <button className="mmp-primary-btn" style={{ flex: 2 }} onClick={handleSave}>
          📥 QR 코드 저장
        </button>
        {/* ✅ [연동 추가] QR 재발급 버튼 */}
        <button
          className="mmp-primary-btn"
          style={{ flex: 1, background: '#8a7a60', fontSize: '0.85rem' }}
          onClick={handleReissue}
          disabled={isReissuing}
        >
          {isReissuing ? '재발급 중...' : '🔄 재발급'}
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   할인 관리 섹션
══════════════════════════════════════════════════════════ */
const DiscountSection = ({ products, onCancel, onRefresh }) => {
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(null);

  if (products.length === 0) {
    return (
      <div className="mmp-empty">
        <span>🏷️</span>
        <p>등록된 품목이 없어요<br />품목을 먼저 등록해주세요!</p>
      </div>
    );
  }

  // ✅ [연동] 할인 취소 → DELETE /market/items/{itemId}/sale
  const handleCancel = async (itemId) => {
    if (!window.confirm('할인을 취소하시겠습니까?')) return;
    setCancelling(itemId);
    try {
      await cancelSale(itemId);
      onRefresh && onRefresh(); // 목록 갱신
    } catch (err) {
      alert(err.message || '할인 취소에 실패했습니다');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="mmp-product-list">
      {products.map(item => {
        const status     = getSaleStatus(item);
        const hasDiscount = item.saleStatus !== 'NONE' && item.discountPrice;

        return (
          <div key={item.id} className="mmp-product-row">
            <div className="mmp-product-row-info">
              <span className="mmp-product-row-name">{item.name}</span>
              <span className="mmp-product-row-price">
                {item.originalPrice?.toLocaleString()}원
              </span>
              {/* ✅ [수정] 백엔드 startTime/endTime 으로 시간 표시 */}
              {hasDiscount && item.startTime && (
                <span style={{ fontSize: '0.76rem', color: '#FF6B35' }}>
                  {item.startTime.slice(11, 16)}~{item.endTime?.slice(11, 16)}
                  · {item.discountRate}% 할인
                </span>
              )}
              {status === 'active' && <span className="mmp-badge-active">🔴 할인 중</span>}
              {status === 'soon'   && <span className="mmp-badge-soon">⏰ 할인 임박</span>}
            </div>
            <div className="mmp-product-row-btns">
              {/* ✅ [수정] navigate로 할인 설정 페이지 이동 */}
              <button
                className="mmp-edit-btn"
                onClick={() => navigate(`/market/items/${item.id}/sale`)}
              >
                {hasDiscount ? '수정' : '등록'}
              </button>
              {hasDiscount && (
                <button
                  className="mmp-delete-btn"
                  onClick={() => handleCancel(item.id)}
                  disabled={cancelling === item.id}
                >
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

/* ══════════════════════════════════════════════════════════
   메인 MarketMyPage
══════════════════════════════════════════════════════════ */
export default function MarketMyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'main';

  // ✅ [수정] localStorage → DB API 로 교체
  // 이전: localStorage에서 shopName, shopId 등 읽어옴
  // 이후: GET /market/mypage 로 DB에서 시장 정보 조회
  const [shopInfo,  setShopInfo]  = useState(null);
  const [products,  setProducts]  = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [logoutOpen, setLogoutOpen] = useState(false);

  // ✅ [연동] 시장 정보 + 품목 목록 조회
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [market, itemList] = await Promise.all([
        getMyMarket(),    // GET /market/mypage
        getMarketItems(), // GET /market/items
      ]);
      setShopInfo(market);
      setProducts(itemList || []);

      // ✅ localStorage에도 백업 (다른 페이지에서 참조할 수 있으므로)
      if (market?.name) localStorage.setItem('shopName', market.name);

    } catch (err) {
      if (err.message === '로그인이 필요합니다') {
        navigate('/market/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleSaveProfile = (updated) => {
    setShopInfo(prev => ({ ...prev, ...updated }));
  };

  const setActiveTab = (tab) => setSearchParams(tab === 'main' ? {} : { tab });
  const goBack       = () => setActiveTab('main');

  // ✅ [수정] 백엔드 saleStatus 기준 통계
  const onSaleCount = products.filter(p => p.saleStatus === 'ON_SALE').length;
  const soonCount   = products.filter(p => p.saleStatus === 'UPCOMING').length;

  // ✅ DB 에서 받은 이름 우선, 없으면 localStorage 폴백
  const shopName = shopInfo?.name || localStorage.getItem('shopName') || '내 가게';

  /* ── 로딩 화면 ── */
  if (isLoading) return (
    <div className="mmp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#8a7a60' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏪</div>
        <div>정보를 불러오는 중...</div>
      </div>
    </div>
  );

  /* ── 서브 탭 라우팅 ── */
  if (activeTab === 'shopprofile') {
    return (
      <ShopProfileEdit
        shopInfo={{
          // ✅ [수정] DB에서 받은 값으로 폼 초기화
          shopId:    shopInfo?.id,
          bizNumber: shopInfo?.businessNumber,
          shopName:  shopInfo?.name,
          ownerName: shopInfo?.ceoName,
          phone:     shopInfo?.phone,
        }}
        onBack={goBack}
        onSave={handleSaveProfile}
      />
    );
  }

  if (activeTab === 'qr') {
    return (
      <PageCard emoji="📱" title="QR 코드" onBack={goBack}>
        {/* ✅ [수정] shopName → shopInfo 전체 전달 + 재발급 콜백 */}
        <QRSection
          marketInfo={shopInfo}
          onReissue={fetchData}  // 재발급 후 데이터 새로고침
        />
      </PageCard>
    );
  }

  if (activeTab === 'discount') {
    return (
      <PageCard emoji="🏷️" title="할인 관리" onBack={goBack}>
        {/* ✅ [수정] localStorage 기반 → DB 기반 products 전달 */}
        <DiscountSection
          products={products}
          onRefresh={fetchData}  // 할인 취소 후 목록 새로고침
        />
      </PageCard>
    );
  }

  /* ── 메인 화면 ── */
  return (
    <div className="mmp-page">

      {/* 헤더 */}
      <div className="mmp-header">
        <button className="mmp-back-btn" onClick={() => navigate('/market/main')}>
          ← 돌아가기
        </button>
        <span className="mmp-header-title">마이페이지</span>
        <div style={{ width: 90 }} />
      </div>

      {/* 프로필 카드 */}
      <div className="mmp-profile-card">
        <div className="mmp-avatar">🏪</div>
        <div className="mmp-profile-info">
          {/* ✅ [수정] DB에서 받은 시장 이름 표시 */}
          <div className="mmp-shop-name">{shopName}</div>

          {/* ✅ [연동 추가] 승인 상태 표시 */}
          <div className="mmp-role-row">
            <div className="mmp-role-badge">
              {shopInfo?.status === 'APPROVED'  && '✅ 승인완료'}
              {shopInfo?.status === 'PENDING'   && '⏳ 승인대기'}
              {shopInfo?.status === 'SUSPENDED' && '🚫 이용정지'}
              {!shopInfo?.status && '소상공인'}
            </div>
            <button className="mmp-logout-btn" onClick={() => setLogoutOpen(true)}>
              로그아웃
            </button>
          </div>

          {/* ✅ [수정] products.length → DB에서 받은 품목 수 */}
          <div className="mmp-stats-row">
            <div className="mmp-stat-item">
              <span className="mmp-stat-num">{products.length}</span>
              <span className="mmp-stat-label">등록 품목</span>
            </div>
            <div className="mmp-stat-divider" />
            <div className="mmp-stat-item">
              <span className="mmp-stat-num" style={{ color: '#FF6B35' }}>{soonCount}</span>
              <span className="mmp-stat-label">할인 임박</span>
            </div>
            <div className="mmp-stat-divider" />
            <div className="mmp-stat-item">
              <span className="mmp-stat-num" style={{ color: '#E53535' }}>{onSaleCount}</span>
              <span className="mmp-stat-label">할인 중</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div className="mmp-menu-list">
        {MENU.map((item, i) => (
          <button
            key={item.id}
            className="mmp-menu-item"
            style={{ animationDelay: `${i * 0.06}s` }}
            onClick={() => {
              if (item.id === 'items_page') navigate('/market/items');
              else setActiveTab(item.id);
            }}
          >
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
            <div className="mmp-modal-desc">
              {shopName} 계정에서<br />로그아웃됩니다.
            </div>
            <div className="mmp-modal-btns">
              <button className="mmp-modal-cancel" onClick={() => setLogoutOpen(false)}>
                취소
              </button>
              <button className="mmp-modal-confirm"
                onClick={() => {
                  localStorage.clear();
                  navigate('/');
                }}
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}