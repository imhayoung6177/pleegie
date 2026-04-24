import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../../Styles/market/MarketMyPage.css';
import ShopProfileEdit from './ShopProfileEdit';

/* ══════════════════════════════════════════════════════════
   상수 & 유틸
══════════════════════════════════════════════════════════ */
const UNIT_OPTIONS = ['원/kg','원/g', '원/개', '원/봉', '원/팩', '원/L' ,'원/ml' ];

const MENU = [
  { id: 'shopprofile', emoji: '✏️', label: '상인정보 수정', desc: '상호명·연락처·주소·비밀번호 변경' },
  { id: 'qr',          emoji: '📱', label: 'QR 코드',      desc: '내 가게 QR코드 확인하기' },
  { id: 'items_page',  emoji: '📦', label: '품목 등록/조회', desc: '새 품목 등록 및 등록된 품목 관리' },
  { id: 'discount',    emoji: '🏷️', label: '할인 관리',     desc: '할인 등록 및 취소' },
  // { id: 'report',      emoji: '🚨', label: '신고하기',      desc: '부정거래·불량 상품 신고' },
];

// const REPORT_CATEGORIES = [
//   '부정거래 의심', '불량 상품 판매', '허위 할인 표시',
//   '원산지 허위 표시', '기타 위법 행위',
// ];

const getSaleStatus = (item, now) => {
  if (!item.saleStart || !item.saleEnd || (!item.discountRate && !item.salePrice)) return 'none';
  const [sh, sm] = item.saleStart.split(':').map(Number);
  const [eh, em] = item.saleEnd.split(':').map(Number);
  const start = new Date(now); start.setHours(sh, sm, 0, 0);
  const end   = new Date(now); end.setHours(eh, em, 0, 0);
  const soon  = new Date(start.getTime() - 60 * 60 * 1000);
  if (now >= start && now < end) return 'active';
  if (now >= soon  && now < start) return 'soon';
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
      <div style={{ width: '100%' }}>
        {children}
      </div>
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
══════════════════════════════════════════════════════════ */
const QRSection = ({ shopName }) => {
  const canvasRef = useRef(null);
  const shopUrl   = `pleegie.market/${encodeURIComponent(shopName)}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const S    = 200;
    const C    = 10;
    const CELLS = S / C;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#2a1f0e';

    const seed = shopName.split('').reduce((a, c) => ((a * 31) + c.charCodeAt(0)) | 0, 0);
    const isDark = (r, c) => (Math.abs(seed ^ (r * 0xdeadbeef) ^ (c * 0xcafebabe)) % 2) === 0;

    // 파인더 패턴 (QR 코드 모서리 마커)
    const drawFinder = (row, col) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          const border = i === 0 || i === 6 || j === 0 || j === 6;
          const inner  = i >= 2 && i <= 4 && j >= 2 && j <= 4;
          if (border || inner) ctx.fillRect((col + j) * C, (row + i) * C, C, C);
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, CELLS - 7);
    drawFinder(CELLS - 7, 0);

    // 데이터 영역
    for (let i = 0; i < CELLS; i++) {
      for (let j = 0; j < CELLS; j++) {
        const inTopLeft     = i < 8 && j < 8;
        const inTopRight    = i < 8 && j >= CELLS - 8;
        const inBottomLeft  = i >= CELLS - 8 && j < 8;
        if (inTopLeft || inTopRight || inBottomLeft) continue;
        if (isDark(i, j)) ctx.fillRect(j * C, i * C, C, C);
      }
    }
  }, [shopName]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${shopName}_QR.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="mmp-qr-wrap">
      <p className="mmp-qr-desc">
        고객이 이 QR코드를 스캔하면<br />내 가게 정보를 바로 확인할 수 있어요
      </p>
      <div className="mmp-qr-box">
        <canvas ref={canvasRef} width={200} height={200} className="mmp-qr-canvas" />
      </div>
      <div className="mmp-qr-shop">{shopName}</div>
      <div className="mmp-qr-url">{shopUrl}</div>
      <button className="mmp-primary-btn" onClick={handleSave}>
        📥 QR 코드 저장
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   할인 관리 섹션 (할인 등록·취소)
══════════════════════════════════════════════════════════ */
const DiscountSection = ({ products, now, onCancel }) => {
  const navigate = useNavigate();

  if (products.length === 0) {
    return (
      <div className="mmp-empty">
        <span>🏷️</span>
        <p>등록된 품목이 없어요<br />품목을 먼저 등록해주세요!</p>
      </div>
    );
  }

  return (
    <>
      <div className="mmp-product-list">
        {products.map(item => {
          const status     = getSaleStatus(item, now);
          const hasDiscount = item.discountRate > 0 || item.salePrice;
          return (
            <div key={item.id} className="mmp-product-row">
              <div className="mmp-product-row-info">
                <span className="mmp-product-row-name">{item.name}</span>
                <span className="mmp-product-row-price">
                  {item.price.toLocaleString()}원/{item.unit}
                </span>
                {hasDiscount && (
                  <span style={{ fontSize: '0.76rem', color: '#FF6B35' }}>
                    {item.saleStart}~{item.saleEnd} · {item.discountRate}% 할인
                  </span>
                )}
                {status === 'active' && <span className="mmp-badge-active">🔴 할인 중</span>}
                {status === 'soon'   && <span className="mmp-badge-soon">⏰ 할인 임박</span>}
              </div>
              <div className="mmp-product-row-btns">
                <button className="mmp-edit-btn" onClick={() => navigate(`/market/items/${item.id}/sale`)}>
                  {hasDiscount ? '수정' : '등록'}
                </button>
                {hasDiscount && (
                  <button className="mmp-delete-btn" onClick={() => onCancel(item.id)}>
                    취소
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════════
   신고하기 섹션
══════════════════════════════════════════════════════════ */
// const ReportSection = ({ shopName }) => {
//   const [category,  setCategory]  = useState('');
//   const [detail,    setDetail]    = useState('');
//   const [submitted, setSubmitted] = useState(false);

//   const handleSubmit = () => {
//     if (!category || !detail.trim()) return;
//     setSubmitted(true);
//   };

//   if (submitted) {
//     return (
//       <div className="mmp-report-done">
//         <div style={{ fontSize: '3rem' }}>✅</div>
//         <div className="mmp-report-done-title">신고가 접수됐어요</div>
//         <div className="mmp-report-done-desc">
//           검토 후 적절한 조치를 취하겠습니다.<br />소중한 신고 감사합니다.
//         </div>
//         <button className="mmp-primary-btn" style={{ marginTop: 8 }}
//           onClick={() => { setSubmitted(false); setCategory(''); setDetail(''); }}>
//           다시 신고하기
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//       <div className="mmp-report-info">
//         <span>🏪</span>
//         <span>신고 대상: <strong>{shopName}</strong></span>
//       </div>
//       <div className="mmp-form-field">
//         <label className="mmp-form-label">신고 유형</label>
//         <select className="mmp-inp" value={category}
//           onChange={e => setCategory(e.target.value)}>
//           <option value="">신고 유형을 선택하세요</option>
//           {REPORT_CATEGORIES.map(c => (
//             <option key={c} value={c}>{c}</option>
//           ))}
//         </select>
//       </div>
//       <div className="mmp-form-field">
//         <label className="mmp-form-label">상세 내용</label>
//         <textarea className="mmp-textarea" rows={4}
//           placeholder="구체적인 내용을 입력해주세요..."
//           value={detail}
//           onChange={e => setDetail(e.target.value)} />
//       </div>
//       <button className="mmp-danger-btn"
//         disabled={!category || !detail.trim()}
//         onClick={handleSubmit}>
//         🚨 신고 접수하기
//       </button>
//     </div>
//   );
// };

/* ══════════════════════════════════════════════════════════
   메인 MarketMyPage
══════════════════════════════════════════════════════════ */
export default function MarketMyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'main';

  const [shopInfo, setShopInfo] = useState(() => ({
    shopId:    localStorage.getItem('shopId')    || 'market_user',
    bizNumber: localStorage.getItem('bizNumber') || '1234567890',
    shopName:  localStorage.getItem('shopName')  || '김씨네 채소가게',
    ownerName: localStorage.getItem('ownerName') || '',
    phone:     localStorage.getItem('shopPhone') || '',
    address:   localStorage.getItem('shopAddress') || '',
  }));

  const shopName = shopInfo.shopName;

  const handleSaveProfile = (updated) => {
    setShopInfo(prev => ({ ...prev, ...updated }));
    localStorage.setItem('shopName',    updated.shopName);
    localStorage.setItem('ownerName',   updated.ownerName);
    localStorage.setItem('shopPhone',   updated.phone);
    localStorage.setItem('shopAddress', updated.address);
  };

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('marketItems');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('marketItems', JSON.stringify(products));
  }, [products]);

  const [logoutOpen, setLogoutOpen] = useState(false);

  const onSaleCount = products.filter(p => getSaleStatus(p, now) === 'active').length;
  const soonCount   = products.filter(p => getSaleStatus(p, now) === 'soon').length;

  const setActiveTab = (tab) => setSearchParams(tab === 'main' ? {} : { tab });
  const goBack       = () => setActiveTab('main');

  /* ── 서브 탭 라우팅 ─────────────────────────────────── */
  if (activeTab === 'shopprofile') {
    return (
      <ShopProfileEdit
        shopInfo={shopInfo}
        onBack={goBack}
        onSave={handleSaveProfile}
      />
    );
  }

  if (activeTab === 'qr') {
    return (
      <PageCard emoji="📱" title="QR 코드" onBack={goBack}>
        <QRSection shopName={shopName} />
      </PageCard>
    );
  }

  if (activeTab === 'discount') {
    return (
      <PageCard emoji="🏷️" title="할인 관리" onBack={goBack}>
        <DiscountSection
          products={products}
          now={now}
          onCancel={(id) =>
            setProducts(prev => prev.map(p =>
              p.id === id
                ? { ...p, saleStart: '', saleEnd: '', salePrice: null, discountRate: 0 }
                : p
            ))
          }
        />
      </PageCard>
    );
  }

  // if (activeTab === 'report') {
  //   return (
  //     <PageCard emoji="🚨" title="신고하기" onBack={goBack}>
  //       <ReportSection shopName={shopName} />
  //     </PageCard>
  //   );
  // }

  /* ── 메인 화면 ──────────────────────────────────────── */
  return (
    <div className="mmp-page">

      {/* 헤더 */}
      <div className="mmp-header">
        <button className="mmp-back-btn" onClick={() => navigate("/market/main")}>
          ← 돌아가기
        </button>
        <span className="mmp-header-title">마이페이지</span>
        <div style={{ width: 90 }} />
      </div>

      {/* 프로필 카드 */}
      <div className="mmp-profile-card">
        <div className="mmp-avatar">
          🏪
          </div>
        <div className="mmp-profile-info">
          <div className="mmp-shop-name">{shopName}</div>
          <div className="mmp-role-row">
            <div className="mmp-role-badge">소상공인</div>
            <button className="mmp-logout-btn" onClick={() => setLogoutOpen(true)}>
              로그아웃
            </button>
          </div>
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

      {/* 로그아웃 확인 모달 */}
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
                onClick={() => { localStorage.clear(); navigate('/'); }}>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
