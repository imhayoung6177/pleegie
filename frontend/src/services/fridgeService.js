import axios from 'axios';

// ────────────────────────────────────────────────────────
// 백엔드(Spring Boot) 연동 완료 후 false 로 변경
// ────────────────────────────────────────────────────────
const USE_MOCK = true;

axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.withCredentials = true;

const MOCK_KEY = 'mock_fridge';
const delay = ms => new Promise(r => setTimeout(r, ms));

export const CATEGORIES = [
  { id: 'veggie', label: '🥦 채소' },
  { id: 'meat',   label: '🥩 육류/해산물' },
  { id: 'dairy',  label: '🥛 유제품' },
  { id: 'grain',  label: '🍚 곡류' },
  { id: 'etc',    label: '🧂 기타' },
];

export const INGREDIENTS_BY_CAT = {
  veggie: [
    {emoji:'🥕',name:'당근'},{emoji:'🧅',name:'양파'},{emoji:'🥦',name:'브로콜리'},
    {emoji:'🥬',name:'배추'},{emoji:'🍅',name:'토마토'},{emoji:'🥔',name:'감자'},
    {emoji:'🌽',name:'옥수수'},{emoji:'🧄',name:'마늘'},{emoji:'🥒',name:'오이'},
    {emoji:'🫑',name:'파프리카'},{emoji:'🍆',name:'가지'},{emoji:'🌿',name:'파'},
  ],
  meat: [
    {emoji:'🥩',name:'소고기'},{emoji:'🍗',name:'닭고기'},{emoji:'🥓',name:'돼지고기'},
    {emoji:'🐟',name:'생선'},{emoji:'🦐',name:'새우'},{emoji:'🦑',name:'오징어'},
    {emoji:'🦀',name:'게'},{emoji:'🐙',name:'문어'},{emoji:'🥚',name:'계란'},
  ],
  dairy: [
    {emoji:'🥛',name:'우유'},{emoji:'🧀',name:'치즈'},{emoji:'🧈',name:'버터'},
    {emoji:'🍦',name:'생크림'},{emoji:'🫙',name:'요거트'},
  ],
  grain: [
    {emoji:'🍚',name:'쌀'},{emoji:'🍝',name:'파스타'},{emoji:'🍞',name:'식빵'},
    {emoji:'🌾',name:'밀가루'},{emoji:'🍜',name:'라면'},{emoji:'🥞',name:'부침가루'},
  ],
  etc: [
    {emoji:'🧂',name:'소금'},{emoji:'🫙',name:'된장'},{emoji:'🌶️',name:'고추장'},
    {emoji:'🫒',name:'올리브유'},{emoji:'🍯',name:'꿀'},{emoji:'🫚',name:'식용유'},
    {emoji:'🍋',name:'레몬즙'},{emoji:'🧴',name:'간장'},{emoji:'🌰',name:'참기름'},
  ],
};

const ALL_INGS = Object.values(INGREDIENTS_BY_CAT).flat();
const findEmoji = name => ALL_INGS.find(i => i.name === name)?.emoji ?? '🥘';

// ── Mock ──────────────────────────────────────────────
const mockLoad = async () => {
  await delay(300);
  return JSON.parse(localStorage.getItem(MOCK_KEY) || '[]');
};

const mockAdd = async ({ name, emoji }) => {
  await delay(400);
  const items = JSON.parse(localStorage.getItem(MOCK_KEY) || '[]');
  if (items.find(i => i.name === name)) throw new Error('이미 등록된 재료입니다.');
  const item = { dbId: Date.now(), name, emoji: emoji || findEmoji(name) };
  localStorage.setItem(MOCK_KEY, JSON.stringify([...items, item]));
  return item;
};

const mockRemove = async (dbId) => {
  await delay(200);
  const items = JSON.parse(localStorage.getItem(MOCK_KEY) || '[]');
  localStorage.setItem(MOCK_KEY, JSON.stringify(items.filter(i => i.dbId !== dbId)));
};

const mockAddByInput = async (userInput) => {
  await delay(700);
  const v = userInput.trim();
  // 유사도 검색 목업: 정확 일치 → 포함 관계 순으로 탐색
  const found = ALL_INGS.find(i => i.name === v)
    ?? ALL_INGS.find(i => i.name.includes(v) || v.includes(i.name))
    ?? { name: v, emoji: '🥘' };
  return mockAdd(found);
};

// ── Real API ──────────────────────────────────────────
const getTodayStr = (daysToAdd = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
};

const apiLoad = async () => {
  const res = await axios.get('/user/fridge/items');
  const items = res.data.data || []; // <- ApiResponse 구조
  const seen = new Set();
  return items
    .filter(item => { if (!item.name || seen.has(item.name)) return false; seen.add(item.name); return true; })
.map(item => ({ 
  dbId: item.id, 
  name: item.name, 
  emoji: findEmoji(item.name),
  status: item.status, // 백엔드의 NEAR_EXPIRY 등을 받아옴
  exp: item.exp        // 날짜 정보도 함께 관리하면 좋음
}));};

const apiAdd = async ({ name, itemMasterId, category, unit }) => {
  const catId = Object.keys(INGREDIENTS_BY_CAT).find(k => INGREDIENTS_BY_CAT[k].some(i => i.name === name));
  const CAT_MAP = { veggie:'VEGGIE', meat:'MEAT', dairy:'DAIRY', grain:'GRAIN', etc:'ETC' };
  const res = await axios.post('/user/fridge/items', {
    itemMasterId,
    category: category || (catId ? CAT_MAP[catId] : 'ETC'),
    quantity: 1.0,
    unit: unit || '개',
    exp: getTodayStr(7),
  });
  return { 
    dbId: res.data.data.id, 
    name: res.data.data.name, 
    emoji: findEmoji(res.data.data.name) 
  };
};

const apiRemove = async (dbId) => {
  await axios.delete(`/user/fridge/items/${dbId}`);
};

const apiAddByInput = async (userInput) => {
  const res = await axios.post('/api/fridge/api-add', { userInput });
  return { dbId: res.data.id, name: res.data.name, emoji: findEmoji(res.data.name) };
};

// ── Export ─────────────────────────────────────────────
export const loadFridge    = USE_MOCK ? mockLoad       : apiLoad;
export const addIngredient = USE_MOCK ? mockAdd        : apiAdd;
export const removeIngredient = USE_MOCK ? mockRemove  : apiRemove;
export const addByInput    = USE_MOCK ? mockAddByInput : apiAddByInput;
