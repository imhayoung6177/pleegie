const QtyModal = ({ item, onSave, onClose }) => {
  const [qty, setQty] = useState(item.qty ?? '');
  const [unit, setUnit] = useState(item.unit ?? 'g');
  // 1. 유통기한 상태 추가 (기본값은 아이템의 기존 날짜)
  const [expiryDate, setExpiryDate] = useState(item.expiryDate ?? '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="qty-modal" onClick={e => e.stopPropagation()}>
        {/* ... 상단 타이틀 생략 ... */}
        
        <p className="qty-modal-label">유통기한 설정</p>
        <div className="qty-input-row">
          {/* 2. 날짜 선택기 추가 */}
          <input 
            className="date-input" 
            type="date" 
            value={expiryDate} 
            onChange={(e) => setExpiryDate(e.target.value)} 
          />
        </div>

        <p className="qty-modal-label">보유 수량 입력</p>
        <div className="qty-input-row">
          <input className="qty-number-inp" type="number" value={qty} onChange={e => setQty(e.target.value)} />
          <select className="unit-select" value={unit} onChange={e => setUnit(e.target.value)}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="qty-btn-row">
          <button className="qty-cancel-btn" onClick={onClose}>취소</button>
          <button className="qty-save-btn" onClick={() => {
            // 3. 저장 시 expiryDate도 함께 전달
            onSave(item.dbId, qty === '' ? null : Number(qty), unit, expiryDate);
            onClose();
          }}>저장하기</button>
        </div>
      </div>
    </div>
  );
};