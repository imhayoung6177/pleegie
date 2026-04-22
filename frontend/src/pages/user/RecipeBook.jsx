import React, { useState } from 'react';

const RecipeBook = () => {
  const [tab, setTab] = useState('recommend'); // recommend(추천) vs search(검색)

  const recipes = {
    recommend: [{ name: '남은 양파로 만드는 덮밥', emoji: '🍱' }],
    search: [{ name: '정통 까르보나라', emoji: '🍝' }]
  };

  return (
    <div className="mp-detail-content">
      <h2 className="mp-section-title">📖 나의 레시피북</h2>
      <div className="cat-tabs" style={{ marginBottom: '20px' }}>
        <button className={`cat-tab-btn ${tab === 'recommend' ? 'active' : ''}`} onClick={() => setTab('recommend')}>AI 추천 레시피</button>
        <button className={`cat-tab-btn ${tab === 'search' ? 'active' : ''}`} onClick={() => setTab('search')}>직접 검색 레시피</button>
      </div>
      <div className="recipe-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {recipes[tab].map((r, i) => (
          <div key={i} className="fridge-item" style={{ animation: 'none' }}>
            <span className="item-emoji">{r.emoji}</span>
            <span className="item-name">{r.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeBook;