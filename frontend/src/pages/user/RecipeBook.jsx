import React, { useState, useEffect } from 'react';

/**
 * RecipeBook.jsx
 *
 * ✅ 백엔드 연동:
 *   GET    /user/recipebook      → 저장한 레시피 목록 조회
 *   DELETE /user/recipebook/{id} → 레시피 삭제
 *
 * ✅ 백엔드 RecipeBookSaveResponse 구조:
 *   { id, title, description, ingredients(콤마구분 문자열), createdAt }
 *
 * ✅ 상세 디자인:
 *   → 사진처럼 RecipeRecommendPage 상세와 완전히 동일한 디자인
 *   → 재료 태그(✅/❌), 부족한 재료 섹션, 요리법 리스트 모두 포함
 *   → ingredients는 DB에 "당근,양파(10g),계란" 형태로 저장되므로 split(',')으로 배열 변환
 */

const RecipeBook = ({ onBack }) => {

  // ── 상태 관리 ──────────────────────────────────────────────
  const [allRecipes,   setAllRecipes]   = useState([]); // 전체 레시피 목록
  const [searchResult, setSearchResult] = useState([]); // 검색 결과
  const [query,        setQuery]        = useState(''); // 검색어 입력값
  const [selected,     setSelected]     = useState(null); // 선택된 레시피 (상세 보기)
  const [isLoading,    setIsLoading]    = useState(true); // 로딩 상태
  const [error,        setError]        = useState(''); // 에러 메시지

  // JWT 인증 헤더 (Spring Security 토큰 검증용)
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  // ── 레시피북 목록 조회 ──────────────────────────────────────
  /**
   * [자바 연동] GET /user/recipebook
   * → RecipeController.getRecipeBook(@AuthUser Long userId)
   * → RecipeService.getRecipeBook(userId)
   * → List<RecipeBookSaveResponse>: { id, title, description, ingredients(문자열), createdAt }
   */
  useEffect(() => {
    const fetchSaved = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/user/recipebook', {
          headers: getAuthHeaders(),
        });
        const json = await res.json();

        if (res.ok && json.success) {
          const data = json.data || [];
          setAllRecipes(data);
          setSearchResult(data);
        } else {
          setError('레시피북을 불러오지 못했습니다.');
        }
      } catch (err) {
        console.error('레시피북 조회 실패:', err);
        setError('서버 연결에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSaved();
  }, []);

  // ── 검색 로직 ───────────────────────────────────────────────
  // 백엔드 DTO 필드명 title 기준으로 필터링
  const handleSearch = () => {
    const q = query.trim();
    setSearchResult(
      q
        ? allRecipes.filter(r => (r.title || '').includes(q))
        : allRecipes
    );
  };

  // ── 삭제 로직 ───────────────────────────────────────────────
  /**
   * [자바 연동] DELETE /user/recipebook/{id}
   * → RecipeController.deleteFromRecipeBook(@AuthUser Long userId, @PathVariable Long id)
   * → RecipeService.deleteFromRecipeBook(userId, recipeBookId)
   * → 본인 레시피북인지 확인(FORBIDDEN) 후 삭제
   */
  const handleRemove = async (e, recipe) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 차단
    const name = recipe.title || '이 레시피';
    if (!window.confirm(`'${name}' 레시피를 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/user/recipebook/${recipe.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        // 성공 시 프론트 상태에서도 제거 (재요청 없이 즉시 반영)
        setAllRecipes(prev   => prev.filter(r => r.id !== recipe.id));
        setSearchResult(prev => prev.filter(r => r.id !== recipe.id));
        if (selected?.id === recipe.id) setSelected(null); // 상세 보기 중이었으면 닫기
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (err) {
      alert('서버 연결 오류가 발생했습니다.');
    }
  };

  // ── 핵심 헬퍼 함수들 ────────────────────────────────────────

  /**
   * [에러 해결 포인트] ingredients 안전 변환
   * DB에 "당근,양파(10g),계란" 형태의 문자열로 저장
   * → split(',')으로 배열 변환 후 공백 제거
   * → 이미 배열이면 그대로 사용
   * → null/undefined면 빈 배열 반환
   * → split is not a function 에러 완전 차단
   */
  const getIngredientList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.split(',').map(i => i.trim()).filter(Boolean);
  };

  /**
   * description에서 요리법 파싱
   * 백엔드에서 description에 "\n\n[🍳 조리법]\n" 형식으로 합쳐서 저장한 경우 분리
   * 없으면 description 전체를 설명으로 사용
   */
  // ✅ [수정 포인트] description에서 설명, 요리법, 소스/양념을 분리
// saveRecipe()에서 저장할 때 마커([🍳 조리법], [🥣 소스/양념])로 구분해서 저장했기 때문에
// 여기서 마커를 기준으로 분리하여 사진처럼 각 섹션을 렌더링
/**
 * description 파싱 함수
 * saveRecipe()에서 저장 시 마커로 구분:
 * "설명\n\n[🍳 조리법]\n요리법\n\n[🥣 소스/양념]\n소스\n\n[🛒 부족한 재료]\n재료"
 * → 각 마커 기준으로 분리하여 섹션별 렌더링
 */
const parseDescription = (desc) => {
  if (!desc) return { intro: '', steps: [], sauceSteps: [], missingIngredients: [] };

  const cookingMarker = '[🍳 조리법]';
  const sauceMarker   = '[🥣 소스/양념]';
  const missingMarker = '[🛒 부족한 재료]';

  // 각 마커 위치 탐색
  const cookingIdx = desc.indexOf(cookingMarker);
  const sauceIdx   = desc.indexOf(sauceMarker);
  const missingIdx = desc.indexOf(missingMarker);

  // 마커 없으면 전체를 설명으로
  if (cookingIdx === -1) {
    return { intro: desc.trim(), steps: [], sauceSteps: [], missingIngredients: [] };
  }

  // 설명: 첫 마커 이전 텍스트
  const intro = desc.slice(0, cookingIdx).trim();

  // 요리법: [🍳 조리법] ~ 다음 마커 사이
  const cookingEnd = sauceIdx !== -1 ? sauceIdx : (missingIdx !== -1 ? missingIdx : desc.length);
  const stepsRaw = desc.slice(cookingIdx + cookingMarker.length, cookingEnd).trim();
  const steps = stepsRaw.split('\n').map(s => s.trim()).filter(Boolean);

  // 소스/양념: [🥣 소스/양념] ~ 다음 마커 사이
  let sauceSteps = [];
  if (sauceIdx !== -1) {
    const sauceEnd = missingIdx !== -1 ? missingIdx : desc.length;
    const sauceRaw = desc.slice(sauceIdx + sauceMarker.length, sauceEnd).trim();
    sauceSteps = sauceRaw.split('\n').map(s => s.trim()).filter(Boolean);
  }

  // 부족한 재료: [🛒 부족한 재료] ~ 끝
  let missingIngredients = [];
  if (missingIdx !== -1) {
    const missingRaw = desc.slice(missingIdx + missingMarker.length).trim();
    missingIngredients = missingRaw.split('\n').map(s => s.trim()).filter(Boolean);
  }

  return { intro, steps, sauceSteps, missingIngredients };
};

  // 레시피 이름/이모지 헬퍼 (null 대비)
  const getRecipeName  = (r) => r.title      || '이름 없는 레시피';
  const getRecipeEmoji = (r) => r.emoji      || '';

  // ── 로딩 화면 ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#8a7a60' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📖</div>
        <p>레시피북을 불러오는 중...</p>
      </div>
    );
  }

  // ── 상세 보기 화면 ──────────────────────────────────────────
  // 사진(이미지1)처럼 레시피 상세와 완전히 동일한 디자인 적용
  if (selected) {
  const ingredientList = getIngredientList(selected.ingredients);
  const { intro, steps, sauceSteps, missingIngredients } = parseDescription(selected.description);

  return (
    <div className="rrp-detail">

      {/* 제목 - 가운데 정렬 */}
      <h2 className="detail-title" style={{ textAlign: 'center' }}>
        {getRecipeName(selected)}
      </h2>

      {/* 저장일 */}
      {selected.createdAt && (
        <p style={{
          fontSize: '0.75rem', color: '#aaa',
          textAlign: 'center', marginBottom: '16px'
        }}>
          저장일: {new Date(selected.createdAt).toLocaleDateString('ko-KR')}
        </p>
      )}

      {/* ── 레시피 설명 ── */}
      {intro && (
        <div className="detail-section">
          <h3>💬 레시피 설명</h3>
          <p style={{ color: '#5a4a32', lineHeight: 1.6 }}>
            {intro}
          </p>
        </div>
      )}

      {/* ── 필요 재료 (보유: 초록✅, 부족: 노란❌) ── */}
      {ingredientList.length > 0 && (
        <div className="detail-section">
          <h3>📋 필요 재료</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {ingredientList.map((ing, i) => {
              // 부족한 재료 목록에 포함되는지 확인
              const isMissing = missingIngredients.some(
                missing => missing === ing
                  || missing.includes(ing)
                  || ing.includes(missing)
              );
              return (
                <span
                  key={i}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: isMissing ? '#fff3e0' : '#e8f5e9',
                    color: '#000000',
                    border: `1px solid ${isMissing ? '#fdd537' : '#4CAF50'}`,
                  }}
                >
                  {isMissing ? '❌ ' : '✅ '}{ing}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 부족한 재료 강조 + 시장 구매 버튼 ── */}
      {missingIngredients.length > 0 && (
        <div className="detail-section">
          <h3>🛒 부족한 재료</h3>
          <p className="missing-alert" style={{ color: '#5a4a32', lineHeight: 1.6 }}>
            ⚠️ {missingIngredients.join(', ')}
          </p>
          {/* 
            [자바 연동] POST /market/missing-items
            → RecipeService.findMissingItemsInMarkets(request)
            → 가까운 시장 5개에서 부족 재료 판매 여부 확인
          */}
          <button
            onClick={async () => {
              // 현재 위치 가져오기 (실패 시 서울 시청 좌표)
              const getLocation = () => new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                  pos => resolve({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                  }),
                  () => resolve({ latitude: 37.5665, longitude: 126.9780 })
                );
              });

              const location = await getLocation();

              try {
                const res = await fetch('/market/missing-items', {
                  method: 'POST',
                  headers: getAuthHeaders(),
                  body: JSON.stringify({
                    missingIngredients: missingIngredients,
                    latitude: location.latitude,
                    longitude: location.longitude
                  })
                });
                const json = await res.json();
                console.log('시장 검색 결과:', json.data?.markets);
              } catch (err) {
                console.error('시장 검색 실패:', err);
              }
            }}
            style={{
              padding: '10px 20px',
              background: '#fdd537',
              color: '#2a1f0e',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            🏪 근처 시장에서 구매하기
          </button>
        </div>
      )}

      {/* ── 요리법 ── */}
      {steps.length > 0 && (
        <div className="detail-section">
          <h3>🍳 요리법</h3>
          <ol style={{ paddingLeft: '20px', color: '#5a4a32', lineHeight: 2 }}>
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* ── 소스/양념 (있을 경우만) ── */}
      {sauceSteps.length > 0 && (
        <div className="detail-section">
          <h3>🥣 소스/양념 만드는 법</h3>
          <ol style={{ paddingLeft: '20px', color: '#5a4a32', lineHeight: 2 }}>
            {sauceSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* 데이터 없을 때 */}
      {!intro && ingredientList.length === 0 && steps.length === 0 && (
        <div style={{
          color: '#8a7a60', fontSize: '0.88rem',
          textAlign: 'center', padding: '20px'
        }}>
          상세 정보가 없습니다.
        </div>
      )}

      {/* ── 목록으로 돌아가기 버튼 (맨 아래, 풀 너비) ── */}
      <div className="detail-section">
        <button
          onClick={() => setSelected(null)}
          style={{
            width: '100%',
            padding: '14px',
            background: '#fdd537',
            color: '#2a1f0e',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '16px',
          }}
        >
          ← 목록으로 돌아가기
        </button>
      </div>

    </div>
  );
}

  // ── 목록 화면 ───────────────────────────────────────────────
  return (
    <div>

      {/* 에러 메시지 배너 */}
      {error && (
        <div style={{
          background: '#fff8ee', border: '1px solid #fdd537',
          borderRadius: '10px', padding: '10px 14px',
          fontSize: '0.82rem', color: '#8a7a60', marginBottom: '16px',
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
            background: 'rgba(255,255,255,0.7)',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '12px 20px', borderRadius: '12px',
            background: '#fdd537', color: '#2a1f0e',
            border: 'none', fontWeight: 700, cursor: 'pointer',
          }}
        >
          검색
        </button>
      </div>

      {/* 레시피 목록 카드 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {searchResult.length === 0 ? (
          // 저장된 레시피 없음 안내
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
                transition: 'background 0.15s',
              }}
            >
              {/* 이모지 */}
              <span style={{ fontSize: '1.8rem' }}>{getRecipeEmoji(r)}</span>

              {/* 레시피 정보 */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#2a1f0e', fontSize: '0.95rem' }}>
                  {getRecipeName(r)}
                </div>
                {/* 재료 미리보기 (처음 3개만 표시) */}
                {getIngredientList(r.ingredients).length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#8a7a60', marginTop: '3px' }}>
                    {getIngredientList(r.ingredients).slice(0, 3).join(', ')}
                    {getIngredientList(r.ingredients).length > 3 && ` 외 ${getIngredientList(r.ingredients).length - 3}가지`}
                  </div>
                )}
                {/* 저장 시각 */}
                {r.createdAt && (
                  <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '2px' }}>
                    저장: {new Date(r.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                )}
              </div>

              {/* 삭제 버튼 */}
              <button
                onClick={e => handleRemove(e, r)}
                style={{
                  background: '#fdd537', border: 'none', color: '#2a1f0e',
                  padding: '6px 14px', borderRadius: '8px',
                  fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                삭제
              </button>
              <span style={{ color: '#fdd537', fontSize: '1.2rem', marginLeft: '4px', flexShrink: 0 }}>›</span>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default RecipeBook;