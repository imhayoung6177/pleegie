// ══════════════════════════════════════════════════════════
// ShopItemAddPage.jsx
// ══════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/market/ShopPage.css';
import '../../Styles/market/MarketMyPage.css';
import '../../Styles/user/MyPage.css';

import pleegemarket from "../../assets/pleegemarket.png";
import { getMyMarket, getMarketItems, createMarketItem, updateMarketItem, deleteMarketItem } from '../../services/marketService';

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

export default function ShopItemAddPage() {
  const navigate = useNavigate();
  const [shopName,  setShopName]  = useState('내 가게');
  const [items,     setItems]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(false);
  const [error,     setError]     = useState('');
  const [toast,     setToast]     = useState('');
  const [itemMasterSearch, setItemMasterSearch] = useState('');
  const [itemMasterResult, setItemMasterResult] = useState(null);
  const [isSearching,      setIsSearching]      = useState(false);
  const [form, setForm] = useState({ name: '', originalPrice: '', unit: '원/개', category: '', stock: '', imageUrl: '' });
  const [editTarget, setEditTarget] = useState(null);
  const [editForm,   setEditForm]   = useState({});

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [market, itemList] = await Promise.all([getMyMarket(), getMarketItems()]);
        setShopName(market?.name || '내 가게');
        setItems(itemList || []);
      } catch (err) {
        if (err.message === '로그인이 필요합니다') { navigate('/market/login'); return; }
        setError(err.message || '데이터를 불러오는데 실패했습니다');
      } finally { setIsLoading(false); }
    };
    fetchData();
  }, [navigate]);

  const handleSearchItemMaster = async () => {
    if (!itemMasterSearch.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`http://localhost:8080/items/search?name=${encodeURIComponent(itemMasterSearch)}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
      if (res.ok) { const json = await res.json(); setItemMasterResult(json.data || json); }
      else { setItemMasterResult({ id: null, name: itemMasterSearch }); showToast('검색 API 미연동 - 이름으로 직접 등록합니다'); }
    } catch { setItemMasterResult({ id: null, name: itemMasterSearch }); }
    finally { setIsSearching(false); }
  };

  const handleAddProduct = async () => {
    if (!form.name.trim() || !form.originalPrice) { showToast('상품명과 가격을 입력해주세요!'); return; }
    const itemMasterId = itemMasterResult?.id || 1;
    setIsSaving(true);
    try {
      const newItem = await createMarketItem({ itemMasterId, name: form.name.trim(), category: form.category.trim() || '기타', originalPrice: Number(form.originalPrice), imageUrl: form.imageUrl || null, stock: Number(form.stock) || 0 });
      setItems(prev => [newItem, ...prev]);
      showToast(`${newItem.name} 등록 완료!`);
      setForm({ name: '', originalPrice: '', unit: '원/개', category: '', stock: '', imageUrl: '' });
      setItemMasterResult(null); setItemMasterSearch('');
    } catch (err) { showToast(err.message || '품목 등록에 실패했습니다'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try { await deleteMarketItem(id); setItems(prev => prev.filter(i => i.id !== id)); showToast('품목이 삭제되었습니다.'); }
    catch (err) { showToast(err.message || '삭제에 실패했습니다'); }
  };

  const saveEdit = async () => {
    try {
      const updated = await updateMarketItem(editTarget.id, { name: editForm.name, category: editForm.category, originalPrice: Number(editForm.originalPrice), imageUrl: editForm.imageUrl || null, stock: Number(editForm.stock) || 0 });
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      setEditTarget(null); showToast('수정이 완료되었습니다.');
    } catch (err) { showToast(err.message || '수정에 실패했습니다'); }
  };

  const startEdit = (item) => {
    setEditTarget(item);
    setEditForm({ name: item.name, originalPrice: item.originalPrice, category: item.category || '', stock: item.stock || 0, imageUrl: item.imageUrl || '' });
  };

  if (isLoading) return (
    <div style={{ position: "relative" }}>
      <div style={BG_LAYER} />
      <div className="mypage-subpage" style={{ position: "relative", zIndex: 1, background: "transparent", minHeight: "100vh", justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#8a7a60', background: 'rgba(255,255,255,0.85)', padding: '32px', borderRadius: '16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📦</div>
          <div>품목 정보를 불러오는 중...</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <div style={BG_LAYER} />
      <div className="mypage-subpage" style={{ position: "relative", zIndex: 1, background: "transparent", minHeight: "100vh" }}>
      <div className="mypage-white-box" style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)' }}>

        <div style={{ textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: 'black', fontWeight: 700, marginBottom: '8px' }}>
          pleegie
        </div>
        <div style={{ textAlign: 'center', marginBottom: '28px', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: '#2a1f0e', margin: '0 0 4px', fontWeight: 700 }}>품목 관리</h2>
          <p style={{ fontSize: '0.88rem', color: '#8a7a60', margin: 0 }}>{shopName} · 품목 등록, 조회, 수정, 삭제</p>
        </div>

        {error && <div style={{ color: '#E53535', textAlign: 'center', marginBottom: '16px' }}>⚠️ {error}</div>}

        <div style={{ width: '100%' }}>
          <div className="item-add-card" style={{ border: 'none', padding: 0, boxShadow: 'none', margin: 0, width: '100%', maxWidth: '100%' }}>

            {/* 재료 검색 */}
            <div className="item-form-field" style={{ marginBottom: '16px' }}>
              <label className="item-form-label">재료 검색 <span style={{ fontSize: '0.75rem', color: '#8a7a60', marginLeft: '6px' }}>(등록할 재료를 먼저 검색하세요)</span></label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="item-form-inp" type="text" placeholder="예) 시금치, 돼지고기"
                  value={itemMasterSearch} onChange={e => setItemMasterSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchItemMaster()} />
                {/* ✅ 검색 버튼 → 그린 */}
                <button onClick={handleSearchItemMaster} disabled={isSearching}
                  style={{ background: MG, color: MT, border: 'none', padding: '0 16px', borderRadius: '11px', fontFamily: 'var(--font-body)', fontSize: '0.88rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {isSearching ? '검색 중...' : '검색'}
                </button>
              </div>
              {itemMasterResult && (
                <div style={{ marginTop: '8px', padding: '10px 14px', background: '#fff8ee', borderRadius: '10px', border: `1.5px solid ${MG}`, fontSize: '0.88rem', color: '#2a1f0e' }}>
                  ✅ 선택된 재료: <strong>{itemMasterResult.name}</strong>
                  {itemMasterResult.id && ` (ID: ${itemMasterResult.id})`}
                </div>
              )}
            </div>

            <div className="item-form-grid">
              <div className="item-form-field">
                <label className="item-form-label">상품명</label>
                <input className="item-form-inp" type="text" placeholder="예) 국내산 시금치 1봉" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="item-form-field">
                <label className="item-form-label">단가 (원)</label>
                <input className="item-form-inp" type="number" placeholder="예) 3000" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} />
              </div>
              <div className="item-form-field">
                <label className="item-form-label">카테고리</label>
                <input className="item-form-inp" type="text" placeholder="예) 채소, 육류, 해산물" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="item-form-field">
                <label className="item-form-label">재고 수량</label>
                <input className="item-form-inp" type="number" placeholder="예) 10" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="item-form-field full-width" style={{ alignItems: 'center', justifyContent: 'center', background: 'rgba(183,204,172,0.08)', borderRadius: 12, border: `1.5px dashed rgba(183,204,172,0.4)`, padding: '16px', marginTop: '8px' }}>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', color: '#2a1f0e', marginTop: 8 }}>{form.name || '상품명'}</div>
                <div style={{ fontSize: '1rem', color: '#8a7a60', marginTop: 2 }}>{form.originalPrice ? `${Number(form.originalPrice).toLocaleString()}원` : '가격 정보'}</div>
              </div>
            </div>

            {/* ✅ 품목 등록 버튼 → 그린 */}
            <button className="item-add-btn" style={{ marginTop: '20px', opacity: isSaving ? 0.6 : 1, background: MG, color: MT, boxShadow: `0 3px 0 ${MGD}` }}
              onClick={handleAddProduct} disabled={isSaving}>
              {isSaving ? '등록 중...' : '품목 등록하기'}
            </button>
          </div>
        </div>

        {/* 품목 목록 */}
        <div style={{ marginTop: '36px', width: '100%' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', marginBottom: '14px', color: '#2a1f0e', borderBottom: `1.5px dashed rgba(183,204,172,0.4)`, paddingBottom: '8px' }}>
            목록 조회 ({items.length}개)
          </h3>
          {items.length === 0 ? (
            <div className="mmp-empty" style={{ margin: 0 }}>
              <span>📦</span>
              <p>등록된 품목이 없어요<br />위 폼에서 상품을 추가해보세요!</p>
            </div>
          ) : (
            <div className="mmp-product-list">
              {items.map(item => (
                <div key={item.id} className="mmp-product-row">
                  <div className="mmp-product-row-info">
                    <span className="mmp-product-row-name">[{item.category || '기타'}] {item.name}</span>
                    <span className="mmp-product-row-price">{item.originalPrice?.toLocaleString()}원 · 재고 {item.stock}개</span>
                    {item.saleStatus === 'ON_SALE'  && <span style={{ fontSize: '0.76rem', color: '#E53535' }}>🔴 할인 중</span>}
                    {item.saleStatus === 'UPCOMING' && <span style={{ fontSize: '0.76rem', color: '#FF6B35' }}>⏰ 할인 임박</span>}
                  </div>
                  <div className="mmp-product-row-btns">
                    {/* ✅ 수정 버튼 → 그린 */}
                    <button className="mmp-edit-btn" style={{ background: MG, color: MT, border: 'none' }} onClick={() => startEdit(item)}>수정</button>
                    <button className="mmp-delete-btn" onClick={() => handleDelete(item.id)}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', flexShrink: 0 }}>
          <div className="auth-divider" style={{ margin: '24px 0 16px' }}><span>취소하시겠어요?</span></div>
          {/* ✅ 돌아가기 버튼 → 그린 */}
          <button className="auth-link-btn"
            style={{ color: MG, borderColor: MG, background: 'rgba(183,204,172,0.06)', display: 'block', width: '100%', padding: '13px', borderRadius: '14px', textAlign: 'center', cursor: 'pointer', fontFamily: 'var(--font-title)', fontSize: '0.92rem', border: `2px solid ${MG}` }}
            onClick={() => navigate('/market/main')}>
            상인 대시보드로 돌아가기
          </button>
        </div>
      </div>

      {/* 수정 모달 */}
      {editTarget && (
        <div className="mmp-modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="mmp-modal" onClick={e => e.stopPropagation()}>
            <div className="mmp-modal-icon">✏️</div>
            <div className="mmp-modal-title">품목 수정</div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '50vh', overflowY: 'auto' }}>
              {[
                { label: '상품명', key: 'name', type: 'text' },
                { label: '단가(원)', key: 'originalPrice', type: 'number' },
                { label: '카테고리', key: 'category', type: 'text' },
                { label: '재고', key: 'stock', type: 'number' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <div className="mmp-form-label" style={{ marginBottom: 4 }}>{label}</div>
                  <input className="mmp-inp" type={type} value={editForm[key] || ''} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="mmp-modal-btns">
              <button className="mmp-modal-cancel" onClick={() => setEditTarget(null)}>취소</button>
              {/* ✅ 저장 버튼 → 그린 */}
              <button className="mmp-modal-confirm" style={{ background: MG, color: MT, boxShadow: 'none' }} onClick={saveEdit}>저장</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="shop-toast">{toast}</div>}
      </div>
    </div>
  );
}