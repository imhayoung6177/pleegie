import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper }          from '../components/layout';
import { Button, SectionTitle } from '../components/ui';
import { IngredientTag }        from '../components/domain';
import axios from 'axios';
import '../styles/FridgePage.css';

/* ── 카테고리 목록 ── */
const CATEGORIES = [
  { id: 'veggie', label: '🥦 채소' },
  { id: 'meat',   label: '🥩 육류/해산물' },
  { id: 'dairy',  label: '🥛 유제품' },
  { id: 'grain',  label: '🍚 곡류' },
  { id: 'etc',    label: '🧂 기타' },
];

const INGREDIENTS_BY_CAT = {
  veggie: [
    {emoji:'🥕',name:'당근',itemMasterId:1},{emoji:'🧅',name:'양파',itemMasterId:2},{emoji:'🥦',name:'브로콜리',itemMasterId:3},
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

const CAT_MAP = {
  veggie:'VEGGIE', meat:'MEAT', dairy:'DAIRY', grain:'GRAIN', etc:'ETC',
};

/* ── 냉장고 시각 패널 ── */
const FridgeVisual = ({ ingredients, onRemove }) => {
  const COLS = 4;
  const totalSlots  = Math.max(ingredients.length + 2, COLS * 3);
  const paddedTotal = Math.ceil(totalSlots / COLS) * COLS;
  const slots = Array.from({ length: paddedTotal }, (_, i) => ingredients[i] ?? null);
  const rows  = [];
  for (let i = 0; i < slots.length; i += COLS) rows.push(slots.slice(i, i + COLS));

  return (
    <div className="fridge-illust">
      {rows.map((row, rowIdx) => (
        <React.Fragment key={rowIdx}>
          <div className="shelf" />
          <div className="fridge-items-grid">
            {row.map((ing, colIdx) => (
              <div key={colIdx} className={`fridge-item-slot ${ing ? 'filled' : 'empty-slot'}`}>
                {ing ? (
                  <>
                    <span>{ing.emoji}</span>
                    <span className="item-name">{ing.name}</span>
                    <button className="item-remove" onClick={() => onRemove(ing)}>✕</button>
                  </>
                ) : '＋'}
              </div>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

/* ── 메인 컴포넌트 ── */
const FridgePage = () => {
  const navigate = useNavigate();

  /* ✅ 초기값 빈 배열 — DB에서만 채워짐 */
  const [myIngredients, setMyIngredients] = useState([]);
  const [activeTab,     setActiveTab]     = useState('veggie');
  const [inputVal,      setInputVal]      = useState('');
  const [isLoading,     setIsLoading]     = useState(true);
  const [savingName,    setSavingName]     = useState(null); // 저장 중인 재료 name

  /* ─────────────────────────────────────────
     DB에서 내 냉장고 재료 불러오기
     ✅ 응답에 name, emoji가 직접 포함되므로
        itemMasterId 매칭 과정이 필요 없음
  ───────────────────────────────────────── */
  const loadFridge = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/fridge', {
        withCredentials: true,
      });

      /* 응답 예시:
         [
           { id:1, fridgeId:1, name:"당근", emoji:"🥕", category:"VEGGIE", ... },
           { id:2, fridgeId:1, name:"양파", emoji:"🧅", category:"VEGGIE", ... }
         ]
         name과 emoji를 DB에 저장했으므로 바로 사용 가능
      */
      // 중복 name 제거 (같은 재료가 여러 번 저장된 경우 첫 번째만 사용)
      const seen = new Set();
      const loaded = res.data
        .filter((item) => {
          if (!item.name || seen.has(item.name)) return false;
          seen.add(item.name);
          return true;
        })
        .map((item) => {
          // ItemMaster에 emoji 없음 → name으로 프론트 목록에서 이모지 찾기
          const allIngs = Object.values(INGREDIENTS_BY_CAT).flat();
          const found   = allIngs.find((i) => i.name === item.name);
          return {
            dbId:  item.id,
            name:  item.name,
            emoji: found ? found.emoji : '🥘', // 없으면 기본 이모지
          };
        });

      setMyIngredients(loaded);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      console.error('냉장고 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadFridge(); }, []);

  /* ─────────────────────────────────────────
     재료 클릭 → 바로 DB 저장
     ✅ name, emoji 도 함께 전송
        → DB에 저장 → 새로고침해도 그대로 유지
  ───────────────────────────────────────── */
  const addIngredient = async (ing) => {
    if (myIngredients.find((i) => i.name === ing.name)) return;

    const catId = Object.keys(INGREDIENTS_BY_CAT).find((key) =>
      INGREDIENTS_BY_CAT[key].some((i) => i.name === ing.name)
    );

    setSavingName(ing.name);
    try {
      const res = await axios.post(
        'http://localhost:8080/api/fridge',
        {
          itemMasterId: ing.itemMasterId,  // ✅ ItemMaster PK 전송
          category:     catId ? CAT_MAP[catId] : 'ETC',
          exp:          '2026-12-31',
          price:        0,
          // fridgeId는 백엔드에서 세션으로 자동 주입
        },
        { withCredentials: true }
      );

      /* ✅ 응답에서 DB에 저장된 데이터로 상태 업데이트
         → 이 데이터만 화면에 표시됨
      */
      // 응답의 name으로 프론트 목록에서 이모지 찾기
      const allIngs = Object.values(INGREDIENTS_BY_CAT).flat();
      const found   = allIngs.find((i) => i.name === res.data.name);
      setMyIngredients((prev) => [
        ...prev,
        {
          dbId:  res.data.id,
          name:  res.data.name,
          emoji: found ? found.emoji : '🥘',
        },
      ]);
    } catch (err) {
      console.error('재료 저장 실패:', err);
      if (err.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } else {
        alert(`저장 실패: ${err.response?.data || err.message}`);
      }
    } finally {
      setSavingName(null);
    }
  };

  /* ── 재료 삭제 → DB에서 삭제 ── */
  const removeIngredient = async (ing) => {
    if (!ing.dbId) {
      setMyIngredients((prev) => prev.filter((i) => i.name !== ing.name));
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/fridge/${ing.dbId}`, {
        withCredentials: true,
      });
      setMyIngredients((prev) => prev.filter((i) => i.dbId !== ing.dbId));
    } catch (err) {
      console.error('재료 삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const removeByName = (name) => {
    const ing = myIngredients.find((i) => i.name === name);
    if (ing) removeIngredient(ing);
  };

  /* ── 직접 입력 ── */
  const handleDirectAdd = () => {
    const v = inputVal.trim();
    if (!v || myIngredients.find((i) => i.name === v)) return;
    addIngredient({ emoji: '🥘', name: v });
    setInputVal('');
  };

  const categoryCount = CATEGORIES.reduce((acc, cat) => {
    const count = myIngredients.filter((ing) =>
      (INGREDIENTS_BY_CAT[cat.id] || []).some((i) => i.name === ing.name)
    ).length;
    return { ...acc, [cat.id]: count };
  }, {});

  if (isLoading) {
    return (
      <PageWrapper navProps={{ showBack: true, backPath: '/user' }}>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'50vh', flexDirection:'column', gap:'16px' }}>
          <div style={{ width:'40px', height:'40px', border:'4px solid #d0e8ff', borderTop:'4px solid #6ab4e8', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          <p style={{ color:'#5a80a8' }}>냉장고 불러오는 중...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper navProps={{ showBack: true, backPath: '/user' }}>
      <div className="fridge-page">
        <div className="fridge-content">

          {/* ━━━ 왼쪽: 냉장고 시각 패널 ━━━ */}
          <div className="fridge-visual-panel anim-fadeUp">
            <div className="fridge-visual-title">🧊 내 냉장고</div>

            <FridgeVisual ingredients={myIngredients} onRemove={removeIngredient} />

            <div className="fridge-stats-row">
              <div className="fridge-stat">
                <div className="s-num">{myIngredients.length}</div>
                <div className="s-label">등록 재료</div>
              </div>
              <div className="fridge-stat">
                <div className="s-num">
                  {myIngredients.filter(
                    (ing) => !Object.values(INGREDIENTS_BY_CAT).flat().some((i) => i.name === ing.name)
                  ).length}
                </div>
                <div className="s-label">직접 입력</div>
              </div>
              <div className="fridge-stat">
                <div className="s-num">{Object.values(categoryCount).filter((c) => c > 0).length}</div>
                <div className="s-label">카테고리</div>
              </div>
            </div>

            <Button variant="primary" full style={{ marginTop:'14px' }}
              onClick={() => navigate('/user/recipe')}>
              🤖 이 재료로 레시피 추천받기
            </Button>
          </div>

          {/* ━━━ 오른쪽: 재료 등록 패널 ━━━ */}
          <div className="register-panel">

            <div className="register-card anim-fadeUp delay-1">
              <div className="register-card-title">➕ 재료 추가하기</div>
              <p style={{ fontSize:'0.8rem', color:'#9a8a70', marginBottom:'12px' }}>
                재료를 클릭하면 바로 냉장고에 저장됩니다 💾
              </p>

              {/* 카테고리 탭 */}
              <div className="category-tabs">
                {CATEGORIES.map((cat) => (
                  <button key={cat.id}
                    className={`cat-tab ${activeTab === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(cat.id)}>
                    {cat.label}
                    {categoryCount[cat.id] > 0 && (
                      <span className="cat-tab-badge">{categoryCount[cat.id]}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* 재료 선택 그리드 */}
              <div className="ingredient-select-grid">
                {(INGREDIENTS_BY_CAT[activeTab] || []).map((ing) => {
                  const isInFridge   = !!myIngredients.find((i) => i.name === ing.name);
                  const isSavingThis = savingName === ing.name;
                  return (
                    <div
                      key={ing.name}
                      className={`ing-select-chip ${isInFridge ? 'selected' : ''}`}
                      onClick={() => isInFridge ? removeByName(ing.name) : addIngredient(ing)}
                      style={{ opacity: isSavingThis ? 0.5 : 1, cursor: isSavingThis ? 'wait' : 'pointer' }}
                    >
                      <span>{isSavingThis ? '⏳' : ing.emoji}</span>
                      <span>{ing.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* 직접 입력 */}
              <div className="direct-input-row">
                <input className="ing-text-input" type="text"
                  placeholder="직접 입력 (예: 새송이버섯)"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDirectAdd()} />
                <Button variant="primary" onClick={handleDirectAdd}>추가</Button>
              </div>
            </div>

            {/* 등록된 재료 목록 */}
            <div className="registered-list anim-fadeUp delay-2">
              <SectionTitle icon="🏷️" right={`${myIngredients.length}개`}>
                등록된 재료
              </SectionTitle>
              <div className="tag-cloud">
                {myIngredients.length === 0 && (
                  <span className="empty-tag-msg">아직 등록된 재료가 없어요 🥲</span>
                )}
                {myIngredients.map((ing) => (
                  <IngredientTag key={ing.dbId} emoji={ing.emoji} name={ing.name} onRemove={removeByName} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default FridgePage;