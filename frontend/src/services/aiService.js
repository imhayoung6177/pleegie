// ────────────────────────────────────────────────────────
// 백엔드(Spring Boot) + LLM 연동 완료 후 false 로 변경
// ────────────────────────────────────────────────────────
const USE_MOCK = true;

const delay = ms => new Promise(r => setTimeout(r, ms));

const RECIPE_DB = [
  { name: '된장찌개',   emoji: '🍲', ingredients: ['된장', '두부', '호박', '양파', '마늘'], time: '20분', difficulty: '쉬움' },
  { name: '계란말이',   emoji: '🥚', ingredients: ['계란', '파', '소금', '식용유'],          time: '10분', difficulty: '쉬움' },
  { name: '감자조림',   emoji: '🥔', ingredients: ['감자', '간장', '참기름', '마늘'],         time: '25분', difficulty: '쉬움' },
  { name: '제육볶음',   emoji: '🥩', ingredients: ['돼지고기', '고추장', '양파', '마늘', '참기름', '간장'], time: '30분', difficulty: '보통' },
  { name: '파스타',     emoji: '🍝', ingredients: ['파스타', '올리브유', '마늘', '소금'],     time: '20분', difficulty: '쉬움' },
  { name: '닭볶음탕',   emoji: '🍗', ingredients: ['닭고기', '감자', '양파', '고추장', '간장', '마늘'], time: '40분', difficulty: '보통' },
  { name: '오이무침',   emoji: '🥒', ingredients: ['오이', '마늘', '고추장', '소금', '참기름'], time: '10분', difficulty: '쉬움' },
  { name: '새우볶음',   emoji: '🦐', ingredients: ['새우', '마늘', '올리브유', '소금', '파프리카'], time: '15분', difficulty: '쉬움' },
  { name: '김치볶음밥', emoji: '🍳', ingredients: ['쌀', '간장', '참기름', '계란', '식용유'], time: '15분', difficulty: '쉬움' },
  { name: '브로콜리 볶음', emoji: '🥦', ingredients: ['브로콜리', '마늘', '간장', '식용유'], time: '10분', difficulty: '쉬움' },
];

const MOCK_MARKETS = [
  { name: '망원 전통시장',   distance: '1.2km', address: '서울 마포구 망원동',    specialty: '신선 채소·수산물' },
  { name: '통인 전통시장',   distance: '2.1km', address: '서울 종로구 통인동',    specialty: '기름떡볶이·식재료' },
  { name: '광장 전통시장',   distance: '3.5km', address: '서울 종로구 종로5가',   specialty: '빈대떡·육류' },
];

// ── Mock ──────────────────────────────────────────────
const mockRecommend = async (myIngredients) => {
  await delay(1400);
  const myNames = myIngredients.map(i => i.name);
  return RECIPE_DB
    .map(r => {
      const matched = r.ingredients.filter(i => myNames.includes(i));
      const missing = r.ingredients.filter(i => !myNames.includes(i));
      return { ...r, matchCount: matched.length, matchRate: Math.round(matched.length / r.ingredients.length * 100), matched, missing };
    })
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 4);
};

const mockSearch = async (foodName, myIngredients) => {
  await delay(1400);
  const myNames = myIngredients.map(i => i.name);
  const recipe = RECIPE_DB.find(r => r.name.includes(foodName) || foodName.includes(r.name))
    ?? { name: foodName, emoji: '🍽️', ingredients: ['재료 정보 없음'], time: '?', difficulty: '?' };
  const have    = recipe.ingredients.filter(i => myNames.includes(i));
  const missing = recipe.ingredients.filter(i => !myNames.includes(i));
  return { recipe, have, missing, markets: missing.length > 0 ? MOCK_MARKETS : [] };
};

// ── Real API (LLM 연동 시) ─────────────────────────────
const apiRecommend = async (myIngredients) => {
  const res = await fetch('/api/ai/recipe/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients: myIngredients.map(i => i.name) }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('레시피 추천 실패');
  return res.json();
};

const apiSearch = async (foodName, myIngredients) => {
  const res = await fetch('/api/ai/recipe/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ foodName, myIngredients: myIngredients.map(i => i.name) }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('레시피 검색 실패');
  return res.json();
};

// ── Export ─────────────────────────────────────────────
export const recommendRecipe = USE_MOCK ? mockRecommend : apiRecommend;
export const searchRecipe    = USE_MOCK ? mockSearch    : apiSearch;
