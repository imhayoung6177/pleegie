import React, { useState } from "react";
import axios from "axios";

const MerchantPage = () => {
  // 1. [상태 관리] 입력 상자에 쓸 재료 정보를 저장할 '바구니'들을 만듭니다.
  const [item, setItem] = useState({
    itemName: "", // 재료 이름
    price: 0, // 가격
    stockNumber: 0, // 수량
    itemDetail: "", // 상세 설명
    discountRate: 0, // 할인율
  });

  // 2. [입력 감시] 상인이 글자를 칠 때마다 바구니에 바로바로 담아주는 함수입니다.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({
      ...item, // 기존에 담겨있던 건 그대로 두고
      [name]: value, // 지금 입력한 칸의 내용만 새로 바꿉니다.
    });
  };

  // 3. [전송 로직] '등록' 버튼을 눌렀을 때 실행되는 함수입니다.
  const handleSubmit = async (e) => {
    e.preventDefault(); // 페이지가 새로고침되는 걸 막아줍니다.

    try {
      // 🚀 백엔드 서버(8080번)의 '재료 등록 창구'로 정보를 보냅니다.
      const response = await axios.post("http://localhost:8080/api/merchant/items/new", item);
      alert(response.data); // "성공적으로 등록되었습니다!" 메시지를 띄웁니다.
    } catch (error) {
      console.error("등록 실패:", error);
      alert("서버가 꺼져있어서 등록할 수 없어요. 하지만 화면은 잘 작동하네요!");
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
      <h2>🍎 상인용 재료 등록</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>재료 이름: </label>
          <input name="itemName" value={item.itemName} onChange={handleChange} placeholder="예: 유기농 사과" />
        </div>
        <br />
        <div>
          <label>가격: </label>
          <input type="number" name="price" value={item.price} onChange={handleChange} /> 원
        </div>
        <br />
        <div>
          <label>수량: </label>
          <input type="number" name="stockNumber" value={item.stockNumber} onChange={handleChange} /> 개
        </div>
        <br />
        <div>
          <label>상세 설명: </label>
          <textarea name="itemDetail" value={item.itemDetail} onChange={handleChange} />
        </div>
        <br />
        <button
          type="submit"
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            border: "none",
            cursor: "pointer",
          }}
        >
          재료 등록하기
        </button>
      </form>
    </div>
  );
};

export default MerchantPage;
