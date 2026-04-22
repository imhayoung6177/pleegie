import React from 'react';
import '../../Styles/user/LedgerPage.css';

const LedgerPage = ({ ledgerItems }) => {
  const total = ledgerItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="mp-detail-content anim-pop">
      <h2 className="mp-section-title">📒 식비 가계부</h2>
      
      <div className="ledger-summary">
        <div className="summary-label">이번 달 지출 합계</div>
        <div className="summary-amount">{total.toLocaleString()}원</div>
      </div>

      <div className="ledger-list">
        {ledgerItems.length === 0 ? (
          <p className="empty-msg">기록된 지출 내역이 없습니다.</p>
        ) : (
          ledgerItems.map((item, idx) => (
            <div key={idx} className="ledger-row">
              <div className="ledger-date">{item.date}</div>
              <div className="ledger-item-name">{item.name}</div>
              <div className="ledger-item-price">-{item.price.toLocaleString()}원</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LedgerPage;