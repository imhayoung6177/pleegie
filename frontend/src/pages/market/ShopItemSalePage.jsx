import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../Styles/market/MarketMyPage.css';
import '../../Styles/user/MyPage.css';
import { getMarketItems, startSale, cancelSale } from '../../services/marketService';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const PRESETS = [10, 20, 30, 50, 70];

  useEffect(() => {
    const load = async () => {
      try {
        const items = await getMarketItems();
        const found = items?.find(i => String(i.id) === String(id));
        if (found) {
          setItem(found);
          // datetime-local input requires "YYYY-MM-DDTHH:MM" format
          setSaleStart(found.startTime ? found.startTime.slice(0, 16) : '');
          setSaleEnd(found.endTime ? found.endTime.slice(0, 16) : '');
          setSalePrice(found.discountPrice != null ? found.discountPrice : '');
        }
      } catch (err) {
        alert(err.message || '품목 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  if (loading) return (
    <div style={{ position: "relative" }}>
      <div style={BG_LAYER} />
      <div className="mypage-subpage" style={{ position: "relative", zIndex: 1, background: "transparent", minHeight: "100vh" }}>
        <div className="mypage-white-box">상품 정보를 불러오는 중입니다...</div>
      </div>
    </div>
  );

  if (!item) return (
    <div style={{ position: "relative" }}>
      <div style={BG_LAYER} />
      <div className="mypage-subpage" style={{ position: "relative", zIndex: 1, background: "transparent", minHeight: "100vh" }}>
        <div className="mypage-white-box">상품 정보를 찾을 수 없습니다.</div>
      </div>
    </div>
  );

  const originalPrice = item.originalPrice ?? item.price ?? 0;
  const currentRate = originalPrice && salePrice
    ? Math.round((1 - Number(salePrice) / originalPrice) * 100)
    : 0;

  const handleSave = async () => {
    const sp = Number(salePrice);
    if (!sp || sp <= 0) { alert('할인가를 입력해주세요.'); return; }
    if (!saleStart || !saleEnd) { alert('할인 시작/종료 일시를 입력해주세요.'); return; }
    if (new Date(saleEnd) <= new Date(saleStart)) { alert('종료 일시는 시작 일시보다 늦어야 합니다.'); return; }
    if (new Date(saleEnd) <= new Date()) { alert('종료 일시가 현재 시각보다 늦어야 합니다.'); return; }

    const rate = originalPrice ? Math.round((1 - sp / originalPrice) * 100) : 0;

    setSaving(true);
    try {
      await startSale(item.id, {
        startTime: saleStart + ':00',
        endTime: saleEnd + ':00',
        discountRate: rate,
        discountPrice: sp,
      });
      showToast('할인 설정이 저장되었습니다!');
      setTimeout(() => navigate('/market/mypage?tab=discount'), 1000);
    } catch (err) {
      alert(err.message || '할인 설정 실패');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelDiscount = async () => {
    if (!window.confirm('할인을 취소하시겠습니까?')) return;
    setSaving(true);
    try {
      await cancelSale(item.id);
      showToast('할인이 취소되었습니다.');
      setTimeout(() => navigate('/market/mypage?tab=discount'), 1000);
    } catch (err) {
      alert(err.message || '할인 취소 실패');
    } finally {
      setSaving(false);
    }
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
            특정 기간에 할인된 가격으로 판매해보세요
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div className="mmp-form-label" style={{ marginBottom: 4 }}>할인가 (원)</div>
            <input className="mmp-inp" type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="할인 가격을 입력하세요" />
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <button key={p} className="mmp-preset-btn"
                  style={currentRate === p ? { background: '#FF6B35', borderColor: '#FF6B35', color: '#fff' } : {}}
                  onClick={() => setSalePrice(Math.round(originalPrice * (1 - p / 100)))}>
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mmp-form-label" style={{ marginBottom: 4 }}>할인 시작 일시</div>
            <input className="mmp-inp" type="datetime-local" value={saleStart} onChange={e => setSaleStart(e.target.value)} />
          </div>

          <div>
            <div className="mmp-form-label" style={{ marginBottom: 4 }}>할인 종료 일시</div>
            <input className="mmp-inp" type="datetime-local" value={saleEnd} onChange={e => setSaleEnd(e.target.value)} />
          </div>

          {salePrice > 0 && (
            <div className="mmp-price-preview">
              <span className="mmp-price-original">{originalPrice?.toLocaleString()}원</span>
              <span style={{ color: 'var(--c-text-soft)' }}>→</span>
              <span className="mmp-price-sale">{Number(salePrice).toLocaleString()}원</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button className="mmp-primary-btn" style={{ flex: 1, background: '#E53535' }} onClick={handleCancelDiscount} disabled={saving}>할인 취소</button>
            <button className="mmp-primary-btn" style={{ flex: 2 }} onClick={handleSave} disabled={saving}>
              {saving ? '처리 중...' : '저장하기'}
            </button>
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
