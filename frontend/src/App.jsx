import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FridgePage from './pages/FridgePage';
// 필요한 다른 페이지들도 import 하세요.

const App = () => {
  return (
    <Routes>
      {/* 첫 화면 (/)에 우리가 만든 냉장고 페이지를 배치합니다 */}
      <Route path="/*" element={<Homepage />} />
      
      {/* 나머지 주소 설정 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/fridge" element={<FridgePage />} />
      
      {/* 팁: 소상공인 로그인이 따로 있다면 아래처럼 추가 가능합니다 */}
      {/* <Route path="/shop/login" element={<ShopLoginPage />} /> */}
    </Routes>
  );
};

export default App;