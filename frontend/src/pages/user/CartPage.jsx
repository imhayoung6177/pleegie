import React, { useState } from 'react';
import '../../Styles/user/CartPage.css';

const INIT_CART = [
  { id: 1, name: '소고기', price: 15000, emoji: '🥩', desc: '스테이크용 200g' },
  { id: 2, name: '애호박', price: 2000,  emoji: '🥒', desc: '된장찌개용 1개' },
  { id: 3, name: '두부',   price: 1500,  emoji: '🌫️', desc: '찌개용 1모' },
];

const CartPage = ({ onPurchase }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const combined = [...INIT_CART, ...saved];
    return Array.from(new Map(combined.map(item => [item.name, item])).values());
  });

  const handleBuy = (item) => {
    alert(`'${item.name}' 구매가 완료되었습니다!\n(가계부 지출 내역에 등록됩니다)`);
    if (onPurchase) onPurchase(item);
    setCartItems(prev => prev.filter(i => i.id !== item.id));
    const saved = JSON.parse(localStorage.getItem('cartItems') || '[]');
    localStorage.setItem('cartItems', JSON.stringify(saved.filter(i => i.name !== item.name)));
  };

  const handleRemove = (item) => {
    if (!window.confirm(`'${item.name}'을(를) 장바구니에서 삭제하시겠습니까?`)) return;
    setCartItems(prev => prev.filter(i => i.id !== item.id));
    const saved = JSON.parse(localStorage.getItem('cartItems') || '[]');
    localStorage.setItem('cartItems', JSON.stringify(saved.filter(i => i.name !== item.name)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {cartItems.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '32px 0' }}>
          장바구니가 비었습니다 🛍️
        </p>
      ) : cartItems.map(item => (
        <div key={item.id} style={{
          display: 'flex', alignItems: 'center', padding: '16px',
          background: 'white', borderRadius: '18px',
          border: '1.5px solid rgba(255,107,53,0.2)',
        }}>
          <span style={{ fontSize: '2rem', marginRight: '15px' }}>{item.emoji}</span>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <strong style={{ fontSize: '1rem', color: '#333' }}>{item.name}</strong>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>{item.desc}</span>
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'flex-end', gap: '6px',
          }}>
            <span style={{ fontWeight: 700, color: '#FF6B35' }}>
              {item.price.toLocaleString()}원
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="cart-remove-btn"
                onClick={() => handleRemove(item)}
              >
                삭제
              </button>
              <button
                onClick={() => handleBuy(item)}
                style={{
                  background: '#FF6B35',
                  color: 'white', border: 'none', padding: '6px 14px',
                  borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                구매 완료
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartPage;