import React from 'react';
import '../../styles/Button.css';

/**
 * Button — 공통 버튼
 *
 * Props:
 *  variant  {'primary'|'orange'|'green'|'ghost'|'danger'}
 *  size     {'sm'|'md'|'lg'}
 *  full     {boolean}  width 100%
 *  loading  {boolean}  로딩 스피너 표시
 *  disabled {boolean}
 *  onClick  {function}
 *  children {node}
 */
const Button = ({
  variant  = 'primary',
  size     = 'md',
  full     = false,
  loading  = false,
  disabled = false,
  onClick,
  children,
  ...rest
}) => {
  const cls = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : '',
    size === 'lg' ? 'btn-lg' : '',
    full          ? 'btn-full' : '',
  ].filter(Boolean).join(' ');

  return (
    <button className={cls} onClick={onClick} disabled={disabled || loading} {...rest}>
      {loading && <span className="btn-spinner" />}
      {children}
    </button>
  );
};

export default Button;