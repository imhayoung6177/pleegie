import React from 'react';
import TopNav from './TopNav';
import '../../styles/PageWrapper.css';

/**
 * PageWrapper — 공통 페이지 껍데기
 * 타일 배경 + TopNav + 주방 바닥을 한번에 처리
 *
 * Props:
 *  navProps  {object} TopNav에 전달할 props
 *  children  {node}   페이지 본문
 */
const PageWrapper = ({ navProps = {}, children }) => (
  <div className="page-wrapper">
    <TopNav {...navProps} />
    <div className="page-wrapper-content">
      {children}
    </div>
    <div className="page-floor" />
  </div>
);

export default PageWrapper;