import React, { useState } from 'react';
import '../../Styles/user/CartPage.css';

const CartPage = ({ onPurchase }) => {
  const [cartItems, setCartItems] = useState(() => {
    const INIT_CART = [
      { id: 1, name: '소고기', price: 15000, emoji: '🥩', desc: '스테이크용' },
      { id: 2, name: '애호박', price: 2000, emoji: '🥒', desc: '된장찌개용' },
      { id: 3, name: '두부', price: 1500, emoji: '⬜', desc: '찌개용' },
    ];
    const saved = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const combined = [...INIT_CART, ...saved];
    // 이름 기준으로 중복 제거하여 불러오기
    return Array.from(new Map(combined.map(item => [item.name, item])).values());
  });

  const handleBuy = (item) => {
    // 구매 완료 알림
    alert(`'${item.name}' 구매가 완료되었습니다!\n(가계부 지출 내역에 등록됩니다)`);
    // 1. 가계부로 데이터 전달 (부모 컴포넌트의 함수 호출)
    if (onPurchase) onPurchase(item);
    // 2. 장바구니에서 삭제
    setCartItems(prev => prev.filter(i => i.id !== item.id));
    
    // 3. 로컬 스토리지에서도 삭제 동기화
    const saved = JSON.parse(localStorage.getItem('cartItems') || '[]');
    localStorage.setItem('cartItems', JSON.stringify(saved.filter(i => i.name !== item.name)));
  };

  return (
    <div className="mp-detail-content anim-pop">
      <h2 className="mp-section-title">🛒 장바구니</h2>
      <div className="cart-list">
        {cartItems.length === 0 ? (
          <p className="empty-msg">장바구니가 비었습니다.</p>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="cart-card">
              <span className="cart-emoji">{item.emoji}</span>
              <div className="cart-info">
                <strong className="cart-name">{item.name}</strong>
                <span className="cart-desc">{item.desc}</span>
              </div>
              <div className="cart-action">
                <span className="cart-price">{item.price.toLocaleString()}원</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="buy-btn" onClick={() => handleBuy(item)}>구매 완료</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CartPage;