import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/market/ShopPage.css';
import '../../Styles/market/MarketMyPage.css'; // 리스트 및 모달 스타일용
import '../../Styles/user/MyPage.css'; // 레이아웃(흰색 박스)용

// const EMOJI_LIST = [
//   '🥩','🍗','🥚','🐷','🥓',           // 육류
//   '🥦','🧅','🥕','🌿','🥔','🍅','🥒','🍄','🌶️','🥬', // 채소
//   '🦐','🐟','🦑','🦪','🐚',           // 해산물
//   '🥛','🧈','🧀','🫙','🍶',           // 유제품
//   '🌾','🍞','🍝',                      // 곡류
//   '🍎','🍊','🍋','🍇','🍓','🍑',      // 과일
// ];

const UNITS = ['원/kg', '원/개', '원/봉', '원/팩', '원/L'];

export default function ShopItemAddPage() {
  const navigate = useNavigate();
  const shopName = localStorage.getItem('shopName') || '김씨네 채소가게';

  const [form, setForm] = useState({ name: '', price: '', unit: '원/개', saleStart: '', saleEnd: '', salePrice: '' });
  const [selectedEmoji, setEmoji] = useState('🥬');
  const [toast, setToast] = useState('');
  const [items, setItems] = useState([]);
  
  // 수정용 상태
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', unit: '', saleStart: '', saleEnd: '', salePrice: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('marketItems') || '[]');
    setItems(saved);
  }, []);

  const saveItems = (newItems) => {
    setItems(newItems);
    localStorage.setItem('marketItems', JSON.stringify(newItems));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleAddProduct = () => {
    if (!form.name.trim() || !form.price) {
      showToast('상품명과 가격을 입력해주세요!');
      return;
    }

    const priceNum = Number(form.price);
    const salePriceNum = form.salePrice ? Number(form.salePrice) : null;
    const calcDiscountRate = salePriceNum ? Math.round((1 - salePriceNum / priceNum) * 100) : 0;

    const newItem = {
      id: Date.now(),
      name: form.name,
      emoji: selectedEmoji,
      price: priceNum,
      unit: form.unit.replace('원/', ''),
      saleStart: form.saleStart,
      saleEnd: form.saleEnd,
      salePrice: salePriceNum,
      discountRate: calcDiscountRate,
      shopName: shopName,
    };

    saveItems([newItem, ...items]);
    showToast(`${newItem.emoji} ${newItem.name} 등록 완료!`);
    setForm({ name: '', price: '', unit: '원/개', saleStart: '', saleEnd: '', salePrice: '' });
  };

  const handleDelete = (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    saveItems(items.filter(i => i.id !== id));
    showToast('품목이 삭제되었습니다.');
  };

  const startEdit = (item) => {
    setEditTarget(item);
    setEditForm({ 
      name: item.name, 
      price: item.price, 
      unit: item.unit,
      saleStart: item.saleStart || '',
      saleEnd: item.saleEnd || '',
      salePrice: item.salePrice || ''
    });
  };

  const saveEdit = () => {
    const priceNum = Number(editForm.price);
    const salePriceNum = editForm.salePrice ? Number(editForm.salePrice) : null;
    const calcDiscountRate = salePriceNum ? Math.round((1 - salePriceNum / priceNum) * 100) : 0;

    const updated = items.map(i => i.id === editTarget.id 
      ? { 
          ...i, 
          name: editForm.name, 
          price: priceNum, 
          unit: editForm.unit,
          saleStart: editForm.saleStart,
          saleEnd: editForm.saleEnd,
          salePrice: salePriceNum,
          discountRate: calcDiscountRate
        } 
      : i
    );
    saveItems(updated);
    setEditTarget(null);
    showToast('수정이 완료되었습니다.');
  };

  const handleCancelDiscount = () => {
    setEditForm(prev => ({ ...prev, saleStart: '', saleEnd: '', salePrice: '' }));
    showToast('할인 정보가 초기화되었습니다. 저장 버튼을 눌러주세요.');
  };

  return (
    <div className="mypage-subpage">
      <div className="mypage-white-box">
        
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: '1.8rem', color: '#FF6B35', fontWeight: 700, marginBottom: '8px' }}>
          pleegie
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: '#2a1f0e', margin: '0 0 4px', fontWeight: 700 }}>
            {/* 📦 */}
             품목 관리
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#8a7a60', margin: 0 }}>
            품목 등록, 조회, 수정, 삭제를 한 곳에서 관리하세요
          </p>
        </div>

        <div style={{ width: '100%' }}>
          <div className="item-add-card" style={{ border: 'none', padding: 0, boxShadow: 'none', margin: 0, width: '100%', maxWidth: '100%' }}>
            
            {/* 이모지 선택
            <div className="emoji-picker-wrap" style={{ marginBottom: '16px' }}>
              <div className="item-form-label" style={{ marginBottom: 8 }}>
                품목 이미지 선택
              </div>
              <div className="emoji-grid">
                {EMOJI_LIST.map(e => (
                  <button key={e} className={`emoji-btn ${selectedEmoji === e ? 'active' : ''}`} onClick={() => setEmoji(e)}>
                    {e}
                  </button>
                ))}
              </div>
            </div> */}

            {/* 폼 입력 */}
            <div className="item-form-grid">
              <div className="item-form-field">
                <label className="item-form-label">상품명</label>
                <input className="item-form-inp" type="text" placeholder="예) 시금치, 돼지고기" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="item-form-field">
                <label className="item-form-label">단가 (원)</label>
                <input className="item-form-inp" type="number" placeholder="예) 3000" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>

              <div className="item-form-field">
                <label className="item-form-label">단위</label>
                <select className="item-form-inp" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div className="item-form-field">
                <label className="item-form-label">할인 시작 (선택)</label>
                <input className="item-form-inp" type="time" value={form.saleStart} onChange={e => setForm({ ...form, saleStart: e.target.value })} />
              </div>

              <div className="item-form-field">
                <label className="item-form-label">할인 종료 (선택)</label>
                <input className="item-form-inp" type="time" value={form.saleEnd} onChange={e => setForm({ ...form, saleEnd: e.target.value })} />
              </div>

              <div className="item-form-field">
                <label className="item-form-label">할인가 (선택, 원)</label>
                <input className="item-form-inp" type="number" placeholder="예) 1500" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} />
              </div>

              {/* 미리보기 */}
              <div className="item-form-field full-width" style={{ alignItems: 'center', justifyContent: 'center', background: 'rgba(255,248,238,0.6)', borderRadius: 12, border: '1.5px dashed rgba(0,0,0,0.1)', padding: '16px', marginTop: '8px' }}>
                <div style={{ fontSize: '3.2rem', lineHeight: 1 }}>
                    {/* //{selectedEmoji} */}
                    </div>
                <div style={{ fontFamily: "var(--font-title)", fontSize: '1.3rem', color: '#2a1f0e', marginTop: 8 }}>
                  {form.name || '상품명'}
                </div>
                <div style={{ fontSize: '1rem', color: '#8a7a60', marginTop: 2 }}>
                  {form.price ? `${Number(form.price).toLocaleString()}${form.unit}` : '가격 정보'}
                </div>
              </div>
            </div>

            <button className="item-add-btn" style={{ marginTop: '20px' }} onClick={handleAddProduct}>
              품목 등록하기
            </button>
          </div>
        </div>

        {/* ── 등록된 품목 목록 ── */}
        <div style={{ marginTop: '36px', width: '100%' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', marginBottom: '14px', color: '#2a1f0e', borderBottom: '1.5px dashed rgba(0,0,0,0.1)', paddingBottom: '8px' }}>
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
                    <span className="mmp-product-row-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '1.3rem' }}>{item.emoji}</span>
                      {item.name}
                    </span>
                    <span className="mmp-product-row-price">
                      {item.price.toLocaleString()}원/{item.unit}
                    </span>
                  </div>
                  <div className="mmp-product-row-btns">
                    <button className="mmp-edit-btn" onClick={() => startEdit(item)}>수정</button>
                    <button className="mmp-delete-btn" onClick={() => handleDelete(item.id)}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', flexShrink: 0 }}>
          <div className="auth-divider" style={{ margin: '24px 0 16px' }}>
            <span>취소하시겠어요?</span>
          </div>
          <button className="auth-link-btn" onClick={() => navigate(-1)}>
            상인 대시보드로 돌아가기
          </button>
        </div>
        
      </div>

      {/* ── 수정 모달 ── */}
      {editTarget && (
        <div className="mmp-modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="mmp-modal" onClick={e => e.stopPropagation()}>
            <div className="mmp-modal-icon">✏️</div>
            <div className="mmp-modal-title">품목 수정</div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '50vh', overflowY: 'auto', paddingRight: '4px' }}>
              <div>
                <div className="mmp-form-label" style={{ marginBottom: 4 }}>상품명</div>
                <input className="mmp-inp" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <div className="mmp-form-label" style={{ marginBottom: 4 }}>단가 (원)</div>
                <input className="mmp-inp" type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
              </div>
              <div>
                <div className="mmp-form-label" style={{ marginBottom: 4 }}>단위</div>
                <select className="mmp-inp" value={editForm.unit} onChange={e => setEditForm({ ...editForm, unit: e.target.value })}>
                  {UNITS.map(u => <option key={u} value={u.replace('원/', '')}>{u.replace('원/', '')}</option>)}
                </select>
              </div>
              <div>
                <div className="mmp-form-label" style={{ marginBottom: 4 }}>할인 시작</div>
                <input className="mmp-inp" type="time" value={editForm.saleStart} onChange={e => setEditForm({ ...editForm, saleStart: e.target.value })} />
              </div>
              <div>
                <div className="mmp-form-label" style={{ marginBottom: 4 }}>할인 종료</div>
                <input className="mmp-inp" type="time" value={editForm.saleEnd} onChange={e => setEditForm({ ...editForm, saleEnd: e.target.value })} />
              </div>
              <div>
                <div className="mmp-form-label" style={{ marginBottom: 4 }}>할인가 (원)</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="mmp-inp" type="number" placeholder="예) 1500" value={editForm.salePrice} onChange={e => setEditForm({ ...editForm, salePrice: e.target.value })} />
                  <button className="mmp-edit-btn" style={{ background: '#E53535', padding: '11px 14px', borderRadius: '12px', fontSize: '0.92rem', whiteSpace: 'nowrap' }} onClick={handleCancelDiscount}>할인 취소</button>
                </div>
              </div>
            </div>
            <div className="mmp-modal-btns">
              <button className="mmp-modal-cancel" onClick={() => setEditTarget(null)}>취소</button>
              <button className="mmp-modal-confirm" style={{ background: '#FF6B35', boxShadow: 'none' }} onClick={saveEdit}>저장</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="shop-toast">{toast}</div>}
    </div>
  );
}