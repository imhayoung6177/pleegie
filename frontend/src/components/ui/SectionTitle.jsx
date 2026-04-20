import React from 'react';
import '../../styles/SectionTitle.css';

/**
 * SectionTitle — 섹션 헤더
 *
 * Props:
 *  icon     {string}      왼쪽 이모지
 *  size     {'md'|'sm'}
 *  right    {node}        우측 정렬 슬롯 (카운트, 버튼 등)
 *  children {node}        타이틀 텍스트
 */
const SectionTitle = ({ icon, size = 'md', right, children }) => (
  <div className={`section-title ${size === 'sm' ? 'section-title-sm' : ''}`}>
    {icon && <span>{icon}</span>}
    {children}
    {right && <span className="section-title-right">{right}</span>}
  </div>
);

export default SectionTitle;