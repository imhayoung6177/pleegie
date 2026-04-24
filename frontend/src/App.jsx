import React from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage.jsx";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import FridgePage from "./pages/user/FridgePage";
import MyPage from "./pages/user/MyPage";
import MarketLoginPage from "./pages/auth/MarketLoginPage";
import MarketRegisterPage from "./pages/auth/MarketRegisterPage";
import ShopPage from "./pages/market/ShopPage";
import MarketMyPage from "./pages/market/MarketMyPage"; // 상인 마이페이지 불러오기
import ShopItemAddPage from "./pages/market/ShopItemAddPage"; // 새 품목 등록 페이지 불러오기
import ShopItemSalePage from "./pages/market/ShopItemSalePage"; // 할인 등록 페이지 불러오기
import RecipeRecommendPage from "./pages/user/RecipeRecommendPage";
import FoodSearchPage from "./pages/user/FoodSearchPage";
import ChatbotPage from "./pages/user/ChatbotPage"; //  챗봇 페이지
import AdminLoginPage from "./pages/admin/AdminLoginPage"; // 관리자 로그인 페이지 추가 - 황준호
import AdminDashboardPage from "./pages/admin/AdminDashboardPage"; // 관리자 대시보드 페이지 추가 - 황준호
import AdminUserManagePage from "./pages/admin/AdminUserManagePage"; // 회원 관리 페이지 추가 - 황준호
import AdminMarketManagePage from "./pages/admin/AdminMarketManagePage"; // 사업자 관리 페이지 추가 - 황준호
import AdminReportManagePage from "./pages/admin/AdminReportManagePage"; // 신고 관리 페이지 추가 - 황준호
import AdminNoticeManagePage from "./pages/admin/AdminNoticeManagePage"; // 공지 관리 페이지 추가 - 황준호
import AdminStatisticsPage from "./pages/admin/AdminStatisticsPage"; // 통계 조회 페이지 추가 - 황준호

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
      {/* AI 레시피 추천 관련 */}
      <Route path="/user/recipe-recommend" element={<RecipeRecommendPage />} />
      <Route path="/user/food-search" element={<FoodSearchPage />} />
      <Route path="/user/chatbot" element={<ChatbotPage />} />
      {/* 소상공인 관련 */}
      <Route path="/market/login" element={<MarketLoginPage role="SHOP" />} />
      <Route path="/market/register" element={<MarketRegisterPage role="SHOP" />} />
      {/* 상인 대시보드 등이 있다면 여기에 추가 */}
      <Route path="/market/main" element={<ShopPage role="SHOP" />} />
      <Route path="/market/mypage" element={<MarketMyPage />} />
      <Route path="/market/items" element={<ShopItemAddPage role="SHOP" />} />
      <Route path="/market/items/:id/sale" element={<ShopItemSalePage role="SHOP" />} />
      {/* 관리자 관련(황준호)*/}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/users" element={<AdminUserManagePage />} /> {/* 회원 관리 */}
      <Route path="/admin/markets" element={<AdminMarketManagePage />} /> {/* 사업자 관리 */}
      <Route path="/admin/reports" element={<AdminReportManagePage />} /> {/* 신고 관리 */}
      <Route path="/admin/notices" element={<AdminNoticeManagePage />} /> {/* 공지 관리 */}
      <Route path="/admin/statistics" element={<AdminStatisticsPage />} /> {/* 통계 조회 */}
      {/* 잘못된 주소로 들어오면 홈으로 */}
      <Route path="/*" element={<Homepage />} />
    </Routes>
  );
};

export default App;
