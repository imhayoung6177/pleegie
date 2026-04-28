import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../Styles/market/MarketMyPage.css';
import '../../Styles/user/MyPage.css';

import pleegemarket from "../../assets/pleegemarket.png";

const BG_LAYER = {
  position: "fixed",
  top: 0, left: 0,
  width: "100%", height: "100%",
  backgroundImage: `url(${pleegemarket})`,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  zIndex: 0,
};

export default function ShopItemSalePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [saleStart, setSaleStart] = useState('');
  const [saleEnd, setSaleEnd] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [toast, setToast] = useState('');

  const PRESETS = [10, 20, 30, 50, 70];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('marketItems') || '[]');
    const found = saved.find(i => String(i.id) === String(id));
    if (found) {
      setItem(found);
      setSaleStart(found.saleStart || '18:00');
      setSaleEnd(found.saleEnd || '20:00');
      setSalePrice(found.salePrice != null ? found.salePrice : found.price ?? '');
    }
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  if (!item) return (
    <div style={{ position: "relative" }}>
      <div style={BG_LAYER} />
      <div className="mypage-subpage" style={{ position: "relative", zIndex: 1, background: "transparent", minHeight: "100vh" }}>
        <div className="mypage-white-box">상품 정보를 불러오는 중입니다...</div>
      </div>
    </div>
  );

  const currentRate = item.price && salePrice
    ? Math.round((1 - Number(salePrice) / item.price) * 100)
    : 0;

  const handleSave = () => {
    const sp = Number(salePrice);
    const rate = item.price ? Math.round((1 - sp / item.price) * 100) : 0;

    const saved = JSON.parse(localStorage.getItem('marketItems') || '[]');
    const updated = saved.map(i => i.id === item.id ? { ...i, saleStart, saleEnd, salePrice: sp, discountRate: rate } : i);
    localStorage.setItem('marketItems', JSON.stringify(updated));

    showToast('할인 설정이 저장되었습니다!');
    setTimeout(() => navigate('/market/mypage?tab=discount'), 1000);
  };

  const handleCancelDiscount = () => {
    const saved = JSON.parse(localStorage.getItem('marketItems') || '[]');
    const updated = saved.map(i => i.id === item.id ? { ...i, saleStart: '', saleEnd: '', salePrice: null, discountRate: 0 } : i);
    localStorage.setItem('marketItems', JSON.stringify(updated));

    showToast('할인이 취소되었습니다.');
    setTimeout(() => navigate('/market/mypage?tab=discount'), 1000);
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={BG_LAYER} />
      <div className="mypage-subpage" style={{ position: "relative", zIndex: 1, background: "transparent", minHeight: "100vh" }}>
      <div className="mypage-white-box">
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: 'black', fontWeight: 700, marginBottom: '8px' }}>
          pleegie
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: '#2a1f0e', margin: '0 0 4px', fontWeight: 700 }}>
            🏷️ {item.name} 할인 설정
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#8a7a60', margin: 0 }}>
            특정 시간에 할인된 가격으로 판매해보세요
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div className="mmp-form-label" style={{ marginBottom: 4 }}>할인가 (원)</div>
            <input className="mmp-inp" type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} />
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <button key={p} className="mmp-preset-btn" style={currentRate === p ? { background: '#FF6B35', borderColor: '#FF6B35', color: '#fff' } : {}} onClick={() => setSalePrice(Math.round(item.price * (1 - p / 100)))}>
                  {p}%
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <div className="mmp-form-label" style={{ marginBottom: 4 }}>할인 시작 시각</div>
            <input className="mmp-inp" type="time" value={saleStart} onChange={e => setSaleStart(e.target.value)} />
          </div>
          
          <div>
            <div className="mmp-form-label" style={{ marginBottom: 4 }}>할인 종료 시각</div>
            <input className="mmp-inp" type="time" value={saleEnd} onChange={e => setSaleEnd(e.target.value)} />
          </div>
          
          <div className="mmp-price-preview">
            <span className="mmp-price-original">{item.price?.toLocaleString()}원</span>
            <span style={{ color: 'var(--c-text-soft)' }}>→</span>
            <span className="mmp-price-sale">{Number(salePrice).toLocaleString()}원</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button className="mmp-primary-btn" style={{ flex: 1, background: '#E53535' }} onClick={handleCancelDiscount}>할인 취소</button>
            <button className="mmp-primary-btn" style={{ flex: 2 }} onClick={handleSave}>저장하기</button>
          </div>
        </div>

        <div style={{ marginTop: 'auto', flexShrink: 0 }}>
          <div className="auth-divider" style={{ margin: '24px 0 16px' }}><span>취소하시겠어요?</span></div>
          <button className="auth-link-btn" onClick={() => navigate(-1)}>돌아가기</button>
        </div>
      </div>
      {toast && <div className="shop-toast">{toast}</div>}
      </div>
    </div>
  );
}