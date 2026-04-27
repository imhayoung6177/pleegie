import React, { useState, useEffect } from 'react';

/**
 * RecipeBook.jsx
 *
 * ✅ [수정] localStorage → API 연동
 *
 * 백엔드 엔드포인트:
 *   GET    /user/recipe-book          → 저장한 레시피 목록 조회
 *   POST   /user/recipe-book?recipeId → 레시피 저장
 *   DELETE /user/recipe-book/{id}     → 레시피 삭제
 *
 * 백엔드 RecipeBookResponse 구조:
 *   { id, recipeId, recipeTitle, recipeImageUrl, savedAt }
 */

// ✅ [이전 코드 주석처리] RECIPE_DB 목 데이터 제거
// → 실제 API 연동 후 불필요
// const RECIPE_DB = [
//   { id: 1, emoji: '🍳', name: '계란볶음밥', ... },
//   ...
// ];

const RecipeBook = ({ onBack }) => {
  // ✅ [수정] 초기값 빈 배열 → useEffect에서 API 조회
  const [allRecipes,   setAllRecipes]   = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [query,        setQuery]        = useState('');
  const [selected,     setSelected]     = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState('');

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  // ✅ [연동] 저장한 레시피 목록 조회
  // → GET /user/recipe-book
  // → RecipeBookResponse: { id, recipeId, recipeTitle, recipeImageUrl, savedAt }
  useEffect(() => {
    const fetchSaved = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/user/recipe-book', {
          headers: getAuthHeaders(),
        });
        const json = await res.json();

        if (res.ok) {
          const data = json.data || [];
          setAllRecipes(data);
          setSearchResult(data);
        } else {
          // ✅ API 실패 시 localStorage 폴백
          const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
          setAllRecipes(saved);
          setSearchResult(saved);
        }
      } catch {
        // ✅ 네트워크 오류 시 localStorage 폴백
        const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
        setAllRecipes(saved);
        setSearchResult(saved);
        setError('서버 연결에 실패했습니다. 저장된 레시피를 표시합니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleSearch = () => {
    const q = query.trim();
    setSearchResult(
      q
        ? allRecipes.filter(r =>
            // ✅ [수정] API 응답은 recipeTitle 필드 사용
            // localStorage 폴백은 name 필드 사용
            (r.recipeTitle || r.name || '').includes(q)
          )
        : allRecipes
    );
  };

  // ✅ [연동] 레시피 삭제
  // → DELETE /user/recipe-book/{id}
  // → id: RecipeBook.id (recipeId가 아님!)
  const handleRemove = async (e, recipe) => {
    e.stopPropagation();
    const name = recipe.recipeTitle || recipe.name || '이 레시피';
    if (!window.confirm(`'${name}' 레시피를 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/user/recipe-book/${recipe.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        setAllRecipes(prev   => prev.filter(r => r.id !== recipe.id));
        setSearchResult(prev => prev.filter(r => r.id !== recipe.id));
      } else {
        // ✅ API 없을 시 localStorage에서만 삭제
        const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
        localStorage.setItem(
          'savedRecipes',
          JSON.stringify(saved.filter(r => r.id !== recipe.id))
        );
        setAllRecipes(prev   => prev.filter(r => r.id !== recipe.id));
        setSearchResult(prev => prev.filter(r => r.id !== recipe.id));
      }
    } catch {
      // localStorage fallback
      setAllRecipes(prev   => prev.filter(r => r.id !== recipe.id));
      setSearchResult(prev => prev.filter(r => r.id !== recipe.id));
    }
  };

  // ✅ 레시피 이름 추출 헬퍼
  // → API 응답(recipeTitle) vs localStorage 폴백(name) 두 경우 처리
  const getRecipeName  = (r) => r.recipeTitle  || r.name  || '레시피';
  const getRecipeEmoji = (r) => r.emoji        || '🍽';
  const getRecipeTime  = (r) => r.time         || '-';
  const getRecipeDiff  = (r) => r.difficulty   || '-';

  /* ── 로딩 ── */
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#8a7a60' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📖</div>
        <p>레시피북을 불러오는 중...</p>
      </div>
    );
  }

  /* ── 상세 보기 ── */
  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          style={{
            background: 'none', border: 'none', color: '#FF6B35',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            marginBottom: '16px', padding: 0,
          }}
        >
          ← 목록으로
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontSize: '2.5rem' }}>{getRecipeEmoji(selected)}</span>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', color: '#2a1f0e' }}>
              {getRecipeName(selected)}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#8a7a60' }}>
              ⏱ {getRecipeTime(selected)} · 난이도: {getRecipeDiff(selected)}
            </div>
            {/* ✅ [연동] 저장 시각 표시 */}
            {selected.savedAt && (
              <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '2px' }}>
                저장일: {new Date(selected.savedAt).toLocaleDateString('ko-KR')}
              </div>
            )}
          </div>
        </div>

        {selected.ingredients?.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontWeight: 700, color: '#FF6B35', marginBottom: '10px' }}>
              🥬 필요 재료
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selected.ingredients.map(ing => (
                <span
                  key={ing}
                  style={{
                    background: 'rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '999px', padding: '4px 12px',
                    fontSize: '0.82rem', color: '#5a4a32',
                  }}
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {selected.steps?.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, color: '#FF6B35', marginBottom: '10px' }}>
              📋 조리 순서
            </div>
            {selected.steps.map((step, i) => (
              <div
                key={i}
                style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#FF6B35', color: 'white', fontWeight: 700,
                  fontSize: '0.8rem', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '0.88rem', color: '#444', lineHeight: 1.6 }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* ✅ [연동] API 응답에 상세 정보가 없을 때 안내 */}
        {!selected.ingredients && !selected.steps && (
          <div style={{ color: '#8a7a60', fontSize: '0.88rem', textAlign: 'center', padding: '20px' }}>
            상세 정보는 레시피 검색에서 확인하세요
          </div>
        )}
      </div>
    );
  }

  /* ── 목록 ── */
  return (
    <div>
      {/* 에러 메시지 */}
      {error && (
        <div style={{
          background: '#fff8ee', border: '1px solid #FF6B35',
          borderRadius: '10px', padding: '10px 14px',
          fontSize: '0.82rem', color: '#FF6B35', marginBottom: '16px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* 검색창 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="레시피 이름으로 검색"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: '12px',
            border: '1.5px solid rgba(0,0,0,0.15)',
            fontSize: '0.88rem', outline: 'none',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '12px 20px', borderRadius: '12px',
            background: '#FF6B35', color: 'white',
            border: 'none', fontWeight: 700, cursor: 'pointer',
          }}
        >
          검색
        </button>
      </div>

      {/* 레시피 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {searchResult.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8a7a60' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📖</div>
            <p>저장된 레시피가 없어요</p>
            <p style={{ fontSize: '0.82rem' }}>레시피 추천에서 마음에 드는 레시피를 저장해보세요!</p>
          </div>
        ) : (
          searchResult.map(r => (
            <div
              key={r.id}
              onClick={() => setSelected(r)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px',
                background: 'rgba(0,0,0,0.02)',
                border: '1.5px solid rgba(0,0,0,0.08)',
                borderRadius: '16px', cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>{getRecipeEmoji(r)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#2a1f0e', fontSize: '0.95rem' }}>
                  {getRecipeName(r)}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#8a7a60', marginTop: '2px' }}>
                  ⏱ {getRecipeTime(r)} · 난이도: {getRecipeDiff(r)}
                </div>
                {/* ✅ [연동] 저장 시각 */}
                {r.savedAt && (
                  <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '2px' }}>
                    저장: {new Date(r.savedAt).toLocaleDateString('ko-KR')}
                  </div>
                )}
              </div>
              <button
                onClick={e => handleRemove(e, r)}
                style={{
                  background: '#FF6B35', border: 'none', color: 'white',
                  padding: '6px 14px', borderRadius: '8px',
                  fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                삭제
              </button>
              <span style={{ color: '#FF6B35', fontSize: '1.2rem', marginLeft: '4px' }}>›</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecipeBook;