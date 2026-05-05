import React, { useState, useEffect } from 'react';
import '../../Styles/user/CartPage.css';

const CartPage = ({ onBack }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  // ✅ 1. 장바구니 목록 불러오기 (GET /user/cart)
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/user/cart', {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      if (result.success) {
        setCartItems(result.data || []);
      }
    } catch (err) {
      console.error("장바구니 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  // ✅ 2. 구매 완료 처리 (POST /user/cart/purchase)
  const handleBuy = async (item) => {
    if (!window.confirm(`'${item.itemName}'을(를) 구매하시겠습니까?`)) return;

    try {
      const response = await fetch('/user/cart/purchase', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          cartIds: [item.id], // 백엔드 DTO가 List<Long>을 받으므로 배열로 전달
          category: "식비",    // 기본값 설정 (추후 선택 기능 추가 가능)
          memo: "장바구니 구매"
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(`구매가 완료되었습니다! 가계부에서 확인하실 수 있습니다.`);
        fetchCart(); // 목록 새로고침
      }
    } catch (err) {
      console.error("구매 처리 실패:", err);
      alert("구매 처리 중 오류가 발생했습니다.");
    }
  };

  // ✅ 3. 장바구니 항목 삭제 (DELETE /user/cart/{cartId})
  const handleRemove = async (cartId) => {
    if (!window.confirm("장바구니에서 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/user/cart/${cartId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const result = await response.json();
      if (result.success) {
        fetchCart();
      }
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '32px' }}>장바구니 확인 중...</div>;

  return (
    <div className="cart-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {cartItems.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#2a1f0e', padding: '32px 0' }}>
          장바구니가 비었습니다 🛍️
        </p>
      ) : cartItems.map(item => (
        <div key={item.id} className="cart-card" style={{
          display: 'flex', alignItems: 'center', padding: '16px',
          background: 'white', borderRadius: '18px',
          border: '1.5px solid rgba(253,213,55,0.8)',
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <strong style={{ fontSize: '1rem', color: '#2a1f0e' }}>{item.itemName}</strong>
            <span style={{ fontSize: '0.8rem', color: '#5A4A32' }}>
                {item.marketName ? `🏪 ${item.marketName}` : "📍 직접 입력"}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <span style={{ fontWeight: 700, color: '#2a1f0e' }}>
              {item.price?.toLocaleString()}원
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="cart-remove-btn" onClick={() => handleRemove(item.id)}>삭제</button>
              <button className="cart-buy-btn" onClick={() => handleBuy(item)} style={{
                  background: '#fdd537', color: '#2a1f0e', border: 'none',
                  padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem',
                  cursor: 'pointer', fontWeight: 700,
                }}>
                구매 완료
              </button>
            </div>
          </div>
        </div>
      ))}
      <button className="auth-submit-btn" style={{ marginTop: '12px', width: '100%' }} onClick={onBack}>
        뒤로 가기
      </button>
    </div>
  );
};

export default CartPage;