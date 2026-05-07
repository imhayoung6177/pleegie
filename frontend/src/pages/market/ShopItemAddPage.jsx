// ══════════════════════════════════════════════════════════
// ShopItemAddPage.jsx
// ══════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/market/ShopPage.css';
import '../../Styles/market/MarketMyPage.css';
import '../../Styles/user/MyPage.css';

import pleegemarket from "../../assets/pleegemarket.png";
import {
  getMyMarket, getMarketItems,
  createMarketItem, updateMarketItem, deleteMarketItem,
  startSale, cancelSale,
} from '../../services/marketService';

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

const EMPTY_FORM = { name: '', originalPrice: '', salePrice: '', stock: '', saleStart: '', saleEnd: '', imageUrl: '' };

export default function ShopItemAddPage() {
  const navigate = useNavigate();
  const [shopName,  setShopName]  = useState('내 가게');
  const [items,     setItems]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(false);
  const [error,     setError]     = useState('');
  const [toast,     setToast]     = useState('');
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm,   setEditForm]   = useState({});
  const [suggestions,    setSuggestions]    = useState([]);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [isSearching,    setIsSearching]    = useState(false);
  const debounceTimer = useRef(null);

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


  const searchIngredients = useCallback(async (keyword) => {
      const trimmed = keyword.trim();
  
      // 빈 값이거나 2자 미만이면 드롭다운 초기화
      if (!trimmed || trimmed.length < 2) {
        setSuggestions([]);
        setSelectedMaster(null);
        return;
      }
  
      // 숫자·단위 제거 후 검색 (ex. "시금치 1봉" → "시금치")
      const pureName = trimmed.replace(/[0-9]|g|ml|봉|팩|개|묶음|단|kg/g, '').trim();
      if (!pureName) return;
  
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/ingredients/search?name=${encodeURIComponent(pureName)}&top_k=5`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
        );
        if (!res.ok) throw new Error('검색 실패');
        const json = await res.json();
  
        // Python RAG 응답: { results: [{ id, name, category, similarity }, ...] }
        setSuggestions(json.results || []);
      } catch (e) {
        console.warn('[RAG 검색 실패]', e.message);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, []);
  
    // 수정: 상품명 입력 핸들러 - RAG 검색 트리거
    const handleNameChange = (e) => {
      const value = e.target.value;
      setForm({ ...form, name: value });
      setSelectedMaster(null); // 입력이 바뀌면 이전 선택 초기화
  
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        searchIngredients(value);
      }, 300);
    };
  
    // 수정: 드롭다운에서 재료 선택 시 처리
    const handleSelectSuggestion = (item) => {
      setSelectedMaster(item);          // 선택한 item_master 저장
      setSuggestions([]);               // 드롭다운 닫기
      // 상품명은 사용자가 직접 입력한 값 유지 (ex. "시금치 1봉" 그대로)
    };


 const handleAddProduct = async () => {
  if (!form.name.trim() || !form.originalPrice) {
    showToast('상품명과 단가를 입력해주세요!');
    return;
  }

  setIsSaving(true);
  
  try {
    let itemMasterId;
      let itemCategory;

      if (selectedMaster) {
        // 사용자가 드롭다운에서 직접 선택한 경우
        itemMasterId = selectedMaster.id;
        itemCategory = selectedMaster.category;

      } else {
        // 드롭다운 미선택 → RAG로 한번 더 검색 시도
        const pureName = form.name.replace(/[0-9]|g|ml|봉|팩|개|묶음|단|kg/g, '').trim();
        let ragMatched = null;

        try {
          const res = await fetch(
            `/api/ingredients/search?name=${encodeURIComponent(pureName)}&top_k=1`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
          );
          if (res.ok) {
            const json = await res.json();
            // 유사도 0.7 이상인 경우만 자동 매칭 (너무 낮으면 엉뚱한 재료 매칭 방지)
            const top = json.results?.[0];
            if (top && top.similarity >= 0.7) {
              ragMatched = top;
            }
        }
      } catch (e) {
        console.warn('[RAG 재검색 실패]', e.message);
      }

      if (ragMatched) {
          // RAG 재검색에서 유사도 높은 결과 발견
          itemMasterId = ragMatched.id;
          itemCategory = ragMatched.category;

        } else {
          // RAG에도 없으면 item_master 신규 생성
          try {
            const createRes = await fetch('/item-master', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              },
              body: JSON.stringify({ name: pureName, category: '기타', unit: '개' }),
            });

            if (createRes.ok) {
              const newMaster = await createRes.json();
              itemMasterId = newMaster.data.id;
              itemCategory = newMaster.data.category || '기타';
            } else {
              // 수정: ID 1번 폴백 제거 → 사용자에게 명확한 안내
              showToast('재료 정보를 찾을 수 없습니다. 드롭다운에서 재료를 선택해주세요.');
              setIsSaving(false);
              return;
            }
          } catch (e) {
            showToast('재료 정보를 찾을 수 없습니다. 드롭다운에서 재료를 선택해주세요.');
            setIsSaving(false);
            return;
          }
        }
    }

    // 3. 품목 등록 실행
    const originalPriceNum = Number(form.originalPrice);
    let newItem = await createMarketItem({
      itemMasterId: itemMasterId,
      name: form.name.trim(), // "시금치 1봉" 그대로 저장
      category: itemCategory,
      originalPrice: originalPriceNum,
      imageUrl: form.imageUrl || null,
      stock: Number(form.stock) || 0,
    });

    // 할인 정보가 있으면 startSale 호출
    if (form.salePrice && form.saleStart && form.saleEnd) {
      const sp = Number(form.salePrice);
      const rate = Math.round((1 - sp / originalPriceNum) * 100);
      newItem = await startSale(newItem.id, {
        discountPrice: sp,
        discountRate: rate,
        startTime: form.saleStart + ':00',
        endTime: form.saleEnd + ':00',
      });
    }

    // 4. 성공 처리
    setItems(prev => [newItem, ...prev]);
    showToast(`${newItem.name} 등록 완료!`);
    setForm(EMPTY_FORM);
    setSelectedMaster(null); // 등록 후 선택값 초기화
    setSuggestions([]); // 드롭다운 초기화
  } catch (err) {
    console.error("등록 에러 상세:", err);
    showToast('서버 오류가 발생했습니다. 재료 정보를 확인해주세요.');
  } finally {
    setIsSaving(false);
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteMarketItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      showToast('품목이 삭제되었습니다.');
    } catch (err) { showToast(err.message || '삭제에 실패했습니다'); }
  };

  const saveEdit = async () => {
    try {
      const editOriginalPriceNum = Number(editForm.originalPrice);

      // 1단계: 품목 기본 정보 수정 (이름, 가격, 재고 등)
      // updateMarketItem API는 할인 필드를 무시하므로 기본 정보만 전송
      let updated = await updateMarketItem(editTarget.id, {
        name: editForm.name,
        category: editTarget.category || '기타',
        originalPrice: editOriginalPriceNum,
        imageUrl: editForm.imageUrl || null,
        stock: Number(editForm.stock) || 0,
      });

      const hasNewDiscount = editForm.salePrice && editForm.saleStart && editForm.saleEnd;
      const hadDiscount = editTarget.saleStatus !== 'NONE' && editTarget.discountPrice;

      // 2단계: 할인 정보 처리
      if (hasNewDiscount) {
        // 할인 데이터가 입력됐으면 startSale API 별도 호출
        const sp = Number(editForm.salePrice);
        const rate = Math.round((1 - sp / editOriginalPriceNum) * 100);
        updated = await startSale(editTarget.id, {
          discountPrice: sp,
          discountRate: rate,
          startTime: editForm.saleStart + ':00',
          endTime: editForm.saleEnd + ':00',
        });
      } else if (hadDiscount) {
        // 기존에 할인이 있었는데 필드를 비웠으면 할인 취소
        updated = await cancelSale(editTarget.id);
      }

      setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      setEditTarget(null);
      showToast('수정이 완료되었습니다.');
    } catch (err) { showToast(err.message || '수정에 실패했습니다'); }
  };

  const startEdit = (item) => {
    setEditTarget(item);
    setEditForm({
      name: item.name,
      originalPrice: item.originalPrice,
      // 할인 없는 품목은 빈값으로 초기화 (기존 코드: item.discountPrice || '' 유지)
      salePrice: item.discountPrice || '',
      stock: item.stock || 0,
      // datetime-local 입력은 "YYYY-MM-DDTHH:MM" 형식 필요
      saleStart: item.startTime ? item.startTime.slice(0, 16) : '',
      saleEnd: item.endTime ? item.endTime.slice(0, 16) : '',
      imageUrl: item.imageUrl || '',
    });
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

            <div className="item-form-grid">

              {/* 상품명 필드 - RAG 자동완성 드롭다운 추가 */}
              <div className="item-form-field" style={{ position: 'relative' }}>
                <label className="item-form-label">
                  상품명
                  {/* 재료 선택 완료 시 뱃지 표시 */}
                  {selectedMaster && (
                    <span style={{
                      marginLeft: 8,
                      fontSize: '0.72rem',
                      background: MG,
                      color: MT,
                      borderRadius: 8,
                      padding: '2px 8px',
                      fontWeight: 600,
                    }}>
                      ✓ {selectedMaster.name} 연결됨
                    </span>
                  )}
                </label>

                {/* onChange를 handleNameChange로 교체 (RAG 검색 트리거) */}
                <input
                  className="item-form-inp"
                  type="text"
                  placeholder="예) 국내산 시금치 1봉"
                  value={form.name}
                  onChange={handleNameChange}   // 수정
                  autoComplete="off"
                />

                {/*  RAG 검색 중 표시 */}
                {isSearching && (
                  <div style={{
                    position: 'absolute', right: 12, top: 38,
                    fontSize: '0.75rem', color: '#8a7a60',
                  }}>
                    검색 중...
                  </div>
                )}

                {/* 자동완성 드롭다운 */}
                {suggestions.length > 0 && (
                  <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0, right: 0,
                    zIndex: 100,
                    background: '#fff',
                    border: `1.5px solid ${MG}`,
                    borderRadius: 10,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                    margin: '4px 0 0',
                    padding: 0,
                    listStyle: 'none',
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}>
                    {suggestions.map((item, idx) => (
                      <li
                        key={item.id ?? idx}
                        onClick={() => handleSelectSuggestion(item)}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          borderBottom: idx < suggestions.length - 1 ? `1px solid rgba(183,204,172,0.3)` : 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.9rem',
                          color: MT,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(183,204,172,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                        <span style={{
                          fontSize: '0.72rem',
                          color: '#8a7a60',
                          background: 'rgba(183,204,172,0.25)',
                          borderRadius: 6,
                          padding: '2px 7px',
                        }}>
                          {item.category} · {Math.round((item.similarity ?? 1) * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>


              <div className="item-form-field">
                <label className="item-form-label">단가 (원)</label>
                <input className="item-form-inp" type="number" placeholder="예) 3000" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} />
              </div>
              <div className="item-form-field">
                <label className="item-form-label">할인 가격 (원)</label>
                <input className="item-form-inp" type="number" placeholder="예) 2500" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} />
              </div>
              <div className="item-form-field">
                <label className="item-form-label">재고 수량</label>
                <input className="item-form-inp" type="number" placeholder="예) 10" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="item-form-field">
                <label className="item-form-label">할인 시작 일시</label>
                <input className="item-form-inp" type="datetime-local" value={form.saleStart} onChange={e => setForm({ ...form, saleStart: e.target.value })} />
              </div>
              <div className="item-form-field">
                <label className="item-form-label">할인 종료 일시</label>
                <input className="item-form-inp" type="datetime-local" value={form.saleEnd} onChange={e => setForm({ ...form, saleEnd: e.target.value })} />
              </div>
              <div className="item-form-field full-width" style={{ alignItems: 'center', justifyContent: 'center', background: 'rgba(183,204,172,0.08)', borderRadius: 12, border: `1.5px dashed rgba(183,204,172,0.4)`, padding: '16px', marginTop: '8px' }}>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', color: '#2a1f0e', marginTop: 8 }}>{form.name || '상품명'}</div>
                <div style={{ fontSize: '1rem', color: '#8a7a60', marginTop: 2 }}>
                  {form.originalPrice ? <span style={form.salePrice ? { textDecoration: 'line-through', marginRight: 8 } : {}}>{Number(form.originalPrice).toLocaleString()}원</span> : '가격 정보'}
                  {form.salePrice && <span style={{ color: '#E53535', fontWeight: 'bold' }}>{Number(form.salePrice).toLocaleString()}원</span>}
                </div>
              </div>
            </div>

            <button className="item-add-btn" style={{ marginTop: '20px', opacity: isSaving ? 0.6 : 1, background: MG, color: MT, boxShadow: 'none' }}
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
                    <span className="mmp-product-row-name">{item.name}</span>
                    <span className="mmp-product-row-price">{item.originalPrice?.toLocaleString()}원 · 재고 {item.stock}개</span>
                    {item.saleStatus === 'ON_SALE'  && <span style={{ fontSize: '0.76rem', color: '#E53535' }}>🔴 할인 중</span>}
                    {item.saleStatus === 'UPCOMING' && <span style={{ fontSize: '0.76rem', color: '#FF6B35' }}>⏰ 할인 임박</span>}
                  </div>
                  <div className="mmp-product-row-btns">
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
          <button className="auth-link-btn"
            style={{ color: MG, borderColor: MG, background: 'rgba(183,204,172,0.06)', display: 'block', width: '100%', padding: '13px', borderRadius: '14px', textAlign: 'center', cursor: 'pointer', fontFamily: 'var(--font-title)', fontSize: '0.92rem', border: `2px solid ${MG}` }}
            onClick={() => navigate('/market/mypage')}>
            마이페이지로 돌아가기
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
                { label: '할인 가격(원)', key: 'salePrice', type: 'number' },
                { label: '재고', key: 'stock', type: 'number' },
                { label: '할인 시작 일시', key: 'saleStart', type: 'datetime-local' },
                { label: '할인 종료 일시', key: 'saleEnd', type: 'datetime-local' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <div className="mmp-form-label" style={{ marginBottom: 4 }}>{label}</div>
                  <input className="mmp-inp" type={type} value={editForm[key] || ''} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="mmp-modal-btns">
              <button className="mmp-modal-cancel" onClick={() => setEditTarget(null)}>취소</button>
              <button className="mmp-modal-confirm" style={{ background: MG, color: MT }} onClick={saveEdit}>저장</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="shop-toast">{toast}</div>}
      </div>
    </div>
  );
}
