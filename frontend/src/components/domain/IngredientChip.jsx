import React from 'react';
import '../../styles/IngredientChip.css';

/**
 * =============================================
 * IngredientChip — 재료 인라인 칩 컴포넌트
 * =============================================
 *
 * 사용 위치:
 *  - RecipePage : 내 재료 미리보기 바, 레시피 카드 재료 목록
 *  - MenuPage   : 재료 결과 보유 여부 표시
 *
 * Props:
 * ┌─────────┬──────────────────────────┬──────────────────────────────────┐
 * │ prop    │ 타입                     │ 설명                             │
 * ├─────────┼──────────────────────────┼──────────────────────────────────┤
 * │ emoji   │ string                   │ 재료 이모지 (없으면 생략 가능)   │
 * │ name    │ string                   │ 재료 이름 (필수)                 │
 * │ status  │ 'have' | 'missing' | ''  │ 보유 여부 (기본: 'have')         │
 * │         │                          │  have    → 파란 칩 + ✓ 표시     │
 * │         │                          │  missing → 주황 칩 + ✕ 표시     │
 * │         │                          │  ''      → 기본 칩 (아이콘만)   │
 * │ size    │ 'sm' | 'md'              │ 칩 크기 (기본: 'md')             │
 * └─────────┴──────────────────────────┴──────────────────────────────────┘
 *
 * 사용 예시:
 *  // 기본 (내 재료 미리보기)
 *  <IngredientChip emoji="🥕" name="당근" />
 *
 *  // 보유 재료 (레시피 카드)
 *  <IngredientChip name="양파" status="have" size="sm" />
 *
 *  // 부족한 재료 (레시피 카드)
 *  <IngredientChip name="간장" status="missing" size="sm" />
 */
const IngredientChip = ({ emoji, name, status = 'have', size = 'md' }) => {

  // 상태에 따라 CSS 클래스 결정
  const classes = [
    'ing-chip',
    status === 'missing' ? 'ing-chip-missing' : '',
    size   === 'sm'      ? 'ing-chip-sm'      : '',
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {/* 이모지 */}
      {emoji && <span>{emoji}</span>}

      {/* 보유 여부 아이콘 */}
      {status === 'have'    && '✓ '}
      {status === 'missing' && '✕ '}

      {/* 재료 이름 */}
      {name}
    </span>
  );
};

export default IngredientChip;