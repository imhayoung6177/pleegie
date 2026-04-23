import React, { useState } from 'react';

const RECIPE_DB = [
  { id: 1, emoji: '🍳', name: '계란볶음밥', time: '15분', difficulty: '쉬움',
    ingredients: ['계란 2개', '밥 1공기', '간장 1큰술', '파 약간', '참기름'],
    steps: ['파를 잘게 썰어 준비합니다.', '달궈진 팬에 기름을 두르고 계란을 스크램블합니다.',
            '밥을 넣고 강불에서 볶아줍니다.', '간장, 참기름을 넣고 마지막에 파를 올려 완성합니다.'] },
  { id: 2, emoji: '🥘', name: '된장찌개', time: '20분', difficulty: '쉬움',
    ingredients: ['된장 2큰술', '두부 1/2모', '애호박 1/4개', '양파 1/4개', '멸치육수 2컵'],
    steps: ['멸치육수를 냄비에 넣고 끓입니다.', '된장을 풀어 넣습니다.',
            '두부, 애호박, 양파를 넣고 10분 끓입니다.', '기호에 따라 청양고추를 넣어 완성합니다.'] },
  { id: 3, emoji: '🍜', name: '소고기무국', time: '30분', difficulty: '보통',
    ingredients: ['소고기 150g', '무 200g', '간장 2큰술', '마늘 1큰술', '참기름', '물 4컵'],
    steps: ['소고기를 참기름에 볶아줍니다.', '무를 나박썰기하여 넣고 함께 볶습니다.',
            '물을 붓고 20분간 끓입니다.', '간장과 소금으로 간을 맞춰 완성합니다.'] },
  { id: 4, emoji: '🍝', name: '토마토 파스타', time: '25분', difficulty: '보통',
    ingredients: ['파스타 200g', '토마토 2개', '마늘 3쪽', '올리브오일', '소금', '파르메산치즈'],
    steps: ['파스타를 소금물에 삶습니다(8~10분).', '팬에 올리브오일을 두르고 마늘을 볶습니다.',
            '토마토를 넣고 으깨며 소스를 만듭니다.', '삶은 파스타를 넣고 버무려 치즈를 뿌려 완성합니다.'] },
];

const RecipeBook = () => {
  const [allRecipes] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    const combined = [...saved, ...RECIPE_DB];
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
  });
  const [searchResult, setSearchResult] = useState(allRecipes);
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState(null);

  const handleSearch = () => {
    const q = query.trim();
    setSearchResult(q ? allRecipes.filter(r => r.name.includes(q)) : allRecipes);
  };

  // 상세 보기
  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          style={{
            background: 'none', border: 'none', color: '#e0902a',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            marginBottom: '16px', padding: 0,
          }}
        >
          ← 목록으로
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontSize: '2.5rem' }}>{selected.emoji}</span>
          <div>
            <div style={{
              fontFamily: "'Jua', sans-serif",
              fontSize: '1.3rem', color: '#2a1f0e',
            }}>
              {selected.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#8a7a60' }}>
              ⏱ {selected.time} · 난이도: {selected.difficulty}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontWeight: 700, color: '#e0902a', marginBottom: '10px' }}>
            🥬 필요 재료
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {selected.ingredients.map(ing => (
              <span key={ing} style={{
                background: 'rgba(224,144,42,0.1)',
                border: '1px solid rgba(224,144,42,0.25)',
                borderRadius: '999px', padding: '4px 12px',
                fontSize: '0.82rem', color: '#5a4a32',
              }}>
                {ing}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, color: '#e0902a', marginBottom: '10px' }}>
            📋 조리 순서
          </div>
          {selected.steps.map((step, i) => (
            <div key={i} style={{
              display: 'flex', gap: '12px',
              alignItems: 'flex-start', marginBottom: '10px',
            }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: '#e0902a', color: 'white', fontWeight: 700,
                fontSize: '0.8rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: '0.88rem', color: '#444', lineHeight: 1.6 }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 목록
  return (
    <div>
      {/* 검색창 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="레시피 이름으로 검색 (예: 된장찌개)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: '12px',
            border: '1.5px solid rgba(224,144,42,0.3)',
            fontSize: '0.88rem', outline: 'none',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '12px 20px', borderRadius: '12px',
            background: '#e0902a', color: 'white',
            border: 'none', fontWeight: 700, cursor: 'pointer',
          }}
        >
          검색
        </button>
      </div>

      {/* 레시피 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {searchResult.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa', padding: '24px 0' }}>
            검색 결과가 없어요 😅
          </p>
        ) : searchResult.map(r => (
          <div
            key={r.id}
            onClick={() => setSelected(r)}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 16px',
              background: 'rgba(224,144,42,0.05)',
              border: '1.5px solid rgba(224,144,42,0.15)',
              borderRadius: '16px', cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '1.8rem' }}>{r.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#2a1f0e', fontSize: '0.95rem' }}>
                {r.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#8a7a60', marginTop: '2px' }}>
                ⏱ {r.time} &nbsp;·&nbsp; 난이도: {r.difficulty}
              </div>
            </div>
            <span style={{ color: '#e0902a', fontSize: '1.2rem' }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeBook;