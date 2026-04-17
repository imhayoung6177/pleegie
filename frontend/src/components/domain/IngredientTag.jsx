import React from 'react';
import '../../styles/IngredientTag.css';

/**
 * =============================================
 * IngredientTag — 등록된 재료 태그 컴포넌트
 * =============================================
 *
 * 사용 위치:
 *  - FridgePage : 등록된 재료 태그 클라우드
 *
 * IngredientChip 과의 차이점:
 *  ┌──────────────────┬─────────────────┬──────────────────────┐
 *  │                  │ IngredientTag   │ IngredientChip       │
 *  ├──────────────────┼─────────────────┼──────────────────────┤
 *  │ 주요 용도        │ 재료 등록/삭제  │ 재료 상태 표시       │
 *  │ 삭제 버튼        │ ✅ 있음         │ ❌ 없음              │
 *  │ 상태 표시        │ ❌ 없음         │ ✅ have / missing    │
 *  │ 사용 위치        │ FridgePage      │ RecipePage, MenuPage │
 *  └──────────────────┴─────────────────┴──────────────────────┘
 *
 * Props:
 * ┌──────────┬────────────┬────────────────────────────────────┐
 * │ prop     │ 타입       │ 설명                               │
 * ├──────────┼────────────┼────────────────────────────────────┤
 * │ emoji    │ string     │ 재료 이모지                        │
 * │ name     │ string     │ 재료 이름 (필수)                   │
 * │ onRemove │ function   │ 삭제 핸들러 — 없으면 X 버튼 미표시│
 * └──────────┴────────────┴────────────────────────────────────┘
 *
 * 사용 예시:
 *  // 삭제 가능한 태그 (FridgePage)
 *  <IngredientTag
 *    emoji="🥕"
 *    name="당근"
 *    onRemove={(name) => removeIngredient(name)}
 *  />
 *
 *  // 읽기 전용 태그 (onRemove 없이)
 *  <IngredientTag emoji="🥕" name="당근" />
 */
const IngredientTag = ({ emoji, name, onRemove }) => (
  <span className="ing-tag">

    {/* 이모지 */}
    <span className="ing-tag-emoji">{emoji}</span>

    {/* 재료 이름 */}
    {name}

    {/* 삭제 버튼 — onRemove prop 있을 때만 렌더링 */}
    {onRemove && (
      <button
        className="ing-tag-remove"
        onClick={() => onRemove(name)}
        aria-label={`${name} 삭제`}
      >
        ✕
      </button>
    )}

  </span>
);

export default IngredientTag;