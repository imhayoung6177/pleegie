import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FridgePage.css';

/* ── 데이터 구조 정의 ── */
const CATEGORIES = [
  { id: 'veggie', label: '🥦 채소' },
  { id: 'meat',   label: '🥩 육류/해산물' },
  { id: 'dairy',  label: '🥛 유제품' },
  { id: 'grain',  label: '🍚 곡류' },
  { id: 'etc',    label: '🧂 기타' },
];

const INGREDIENTS_BY_CAT = {
  veggie: [{emoji:'🥕',name:'당근', id:1},{emoji:'🧅',name:'양파', id:2},{emoji:'🥦',name:'브로콜리', id:3}],
  meat: [{emoji:'🥩',name:'소고기', id:4},{emoji:'🍗',name:'닭고기', id:5}],
  dairy: [{emoji:'🥛',name:'우유', id:6},{emoji:'🧀',name:'치즈', id:7}],
  grain: [{emoji:'🍚',name:'쌀', id:8},{emoji:'🍝',name:'파스타', id:9}],
  etc: [{emoji:'🧂',name:'소금', id:10},{emoji:'🍯',name:'꿀', id:11}],
};

const FridgePage = () => {
  const navigate = useNavigate();
  // 사용자가 냉장고에 담은 실제 리스트
  const [myIngredients, setMyIngredients] = useState([]); 
  const [activeTab, setActiveTab] = useState('veggie');
  const [isSaving, setIsSaving] = useState(false);

  /* ── 1. 재료 추가 로직 (수정됨) ── */
  const addIngredient = (ing) => {
    // 중복 체크: 이미 이름이 있으면 추가 안함
    if (myIngredients.find((i) => i.name === ing.name)) {
      alert("이미 냉장고에 있는 재료입니다!");
      return;
    }
    setMyIngredients((prev) => [...prev, ing]);
  };

  /* ── 2. 재료 삭제 로직 ── */
  const removeIngredient = (name) => {
    setMyIngredients((prev) => prev.filter((i) => i.name !== name));
  };

  /* ── 3. DB 저장 로직 (백엔드 FridgeItemDTO 구조와 일치화) ── */
  const handleSaveToDb = async () => {
    if (myIngredients.length === 0) {
      alert("냉장고에 넣을 재료를 먼저 선택해 주세요!");
      return;
    }

    setIsSaving(true);
    try {
      for (const ing of myIngredients) {
        // ⚠️ 중요: 자바 엔티티/DTO 필드명과 100% 일치해야 함
        const payload = {
          fridgeId: 1,           // 테스트용 냉장고 ID (DB에 실제 존재해야 함)
          itemMasterId: ing.id,  // 각 재료의 고유 ID (ItemMaster 참조)
          category: activeTab.toUpperCase(),
          exp: "2026-12-31",     // 유통기한
          price: 1000,           // 임시 가격
          imageUrl: ""
        };

        const response = await fetch('http://localhost:8080/api/fridge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`${ing.name} 저장 실패! (상태코드: ${response.status})`);
        }
      }
      alert('성공적으로 MySQL에 저장되었습니다! 🎉');
      setMyIngredients([]); // 저장 후 바구니 비우기
    } catch (e) {
      console.error(e);
      alert(`에러 발생: ${e.message}\n백엔드 서버와 DB 연결을 확인하세요.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5ede0', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => navigate('/user')}>← 뒤로가기</button>
        <h2>🧊 냉장고 관리 도구</h2>
      </header>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* 왼쪽: 내 냉장고 (장바구니 역할) */}
        <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '15px', minWidth: '300px' }}>
          <h3>🛒 넣을 재료 ({myIngredients.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
            {myIngredients.length === 0 && <p style={{ color: '#999' }}>아래에서 재료를 선택해 주세요.</p>}
            {myIngredients.map(ing => (
              <div key={ing.name} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '10px', background: '#f9f9f9' }}>
                {ing.emoji} {ing.name} 
                <button onClick={() => removeIngredient(ing.name)} style={{ marginLeft: '8px', border: 'none', color: 'red', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
          </div>
          <button 
            onClick={handleSaveToDb}
            disabled={isSaving || myIngredients.length === 0}
            style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#6ab4e8', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}
          >
            {isSaving ? '저장 중...' : '💾 냉장고에 한꺼번에 넣기'}
          </button>
        </div>

        {/* 오른쪽: 재료 선택 창 */}
        <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '15px', minWidth: '300px' }}>
          <h3>✨ 재료 선택</h3>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', overflowX: 'auto' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveTab(cat.id)} style={{ padding: '5px 10px', background: activeTab === cat.id ? '#6ab4e8' : '#eee', border: 'none', borderRadius: '10px' }}>
                {cat.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
            {INGREDIENTS_BY_CAT[activeTab].map(ing => (
              <button 
                key={ing.name} 
                onClick={() => addIngredient(ing)} // ✅ 클릭 시 리스트에 추가됨
                style={{ padding: '15px 10px', border: '1px solid #eee', borderRadius: '12px', background: 'white', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '1.2rem' }}>{ing.emoji}</div>
                <div style={{ fontSize: '0.8rem' }}>{ing.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FridgePage;