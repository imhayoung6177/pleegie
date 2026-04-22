import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage.jsx';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import FridgePage from './pages/user/FridgePage';
import MyPage from './pages/user/MyPage';
import MarketLoginPage from './pages/auth/MarketLoginPage';
import MarketRegisterPage from './pages/auth/MarketRegisterPage';
import ShopPage from './pages/market/ShopPage';

const App = () => {
  return (
    <Routes>
      {/* 메인 홈 */}
      <Route path="/" element={<Homepage />} />
      <Route path="/intro" element={<Homepage />} />

      {/* 일반 사용자 관련 */}
      <Route path="/user/login" element={<LoginPage role="USER" />} />
      <Route path="/user/register" element={<RegisterPage role="USER" />} />
      <Route path="/user/fridge" element={<FridgePage />} />
      <Route path="/user/mypage" element={<MyPage />} />

      {/* 소상공인 관련 */}
      <Route path="/market/login" element={<MarketLoginPage role="SHOP" />} />
      <Route path="/market/register" element={<MarketRegisterPage role="SHOP" />} />
      {/* 상인 대시보드 등이 있다면 여기에 추가 */}
      <Route path="/market/main" element={<ShopPage role="SHOP"/>}/>

      {/* 잘못된 주소로 들어오면 홈으로 */}
      <Route path="/*" element={<Homepage />} />
    </Routes>
  );
};

export default App;