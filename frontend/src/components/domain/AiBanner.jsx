import React from 'react';
import '../../styles/AiBanner.css';

/**
 * =============================================
 * AiBanner — AI 기능 상단 배너 컴포넌트
 * =============================================
 *
 * 사용 위치:
 *  - RecipePage : variant="blue"   (AI 레시피 추천)
 *  - MenuPage   : variant="orange" (재료 추천)
 *
 * Props:
 * ┌─────────┬──────────────────────┬───────────────────────────┐
 * │ prop    │ 타입                 │ 설명                      │
 * ├─────────┼──────────────────────┼───────────────────────────┤
 * │ variant │ 'blue' | 'orange'    │ 배너 색상 테마 (기본 blue)│
 * │ icon    │ string               │ 왼쪽 아이콘 이모지        │
 * │ title   │ string               │ 배너 제목                 │
 * │ desc    │ string | JSX         │ 배너 설명 (줄바꿈 가능)   │
 * └─────────┴──────────────────────┴───────────────────────────┘
 *
 * 사용 예시:
 *  <AiBanner
 *    variant="blue"
 *    icon="🤖"
 *    title="AI 레시피 추천"
 *    desc={<>냉장고 재료를 분석해서<br />레시피를 추천해드려요!</>}
 *  />
 */
const AiBanner = ({ variant = 'blue', icon, title, desc }) => (
  <div className={`ai-banner ai-banner-${variant} anim-fadeUp`}>

    {/* 아이콘 박스 */}
    <div className="ai-banner-icon">
      {icon}
    </div>

    {/* 텍스트 영역 */}
    <div className="ai-banner-body">
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>

  </div>
);

export default AiBanner;