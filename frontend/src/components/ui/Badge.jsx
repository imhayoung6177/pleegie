import React from 'react';
import '../../styles/Badge.css';

/**
 * Badge — 상태 뱃지
 *
 * Props:
 *  variant  {'blue'|'orange'|'green'|'yellow'|'gray'}
 *  children {node}
 */
const Badge = ({ variant = 'blue', children }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

export default Badge;