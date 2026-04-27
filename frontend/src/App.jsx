import React from "react";
import { Routes, Route } from "react-router-dom";
import bgImg from "./assets/image.png";

// 공통 및 사용자 관련
import OAuth2CallbackPage from "./pages/auth/OAuth2CallbackPage.jsx";
import Homepage from "./pages/Homepage.jsx";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import FridgePage from "./pages/user/FridgePage";
import MyPage from "./pages/user/MyPage";
import RecipeRecommendPage from "./pages/user/RecipeRecommendPage";
import FoodSearchPage from "./pages/user/FoodSearchPage";
import ChatbotPage from "./pages/user/ChatbotPage";

// ✅ 마이페이지 하위 독립 페이지 (새로 추가)
import StampPage from "./pages/user/StampPage";
import ReportPage from "./pages/user/ReportPage";
// import CouponPage from "./pages/user/CouponPage"; // 파일 생성 시 주석 해제
// import CurrencyPage from "./pages/user/CurrencyPage"; // 파일 생성 시 주석 해제

// 소상공인 관련
import MarketLoginPage from "./pages/auth/MarketLoginPage";
import MarketRegisterPage from "./pages/auth/MarketRegisterPage";
import ShopPage from "./pages/market/ShopPage";
import MarketMyPage from "./pages/market/MarketMyPage";
import ShopItemAddPage from "./pages/market/ShopItemAddPage";
import ShopItemSalePage from "./pages/market/ShopItemSalePage";
import QrScanPage from './pages/user/QrScanPage';


// 관리자 관련
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUserManagePage from "./pages/admin/AdminUserManagePage";
import AdminMarketManagePage from "./pages/admin/AdminMarketManagePage";
import AdminReportManagePage from "./pages/admin/AdminReportManagePage";
import AdminNoticeManagePage from "./pages/admin/AdminNoticeManagePage";
import AdminStatisticsPage from "./pages/admin/AdminStatisticsPage";

const App = () => {
  return (
    <>
      {/* ✅ 전역 배경 이미지 설정 */}
      <img 
        src={bgImg} 
        alt="background" 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "fill",
          zIndex: -9999,
          pointerEvents: "none"
        }} 
      />
      {/* ✅ 모든 페이지의 기존 배경색을 투명하게 만들어 전역 배경이 보이도록 덮어쓰기 */}
      <style>
        {`
          body, html, #root {
            background: transparent !important; /* ✅ 단색 배경을 지우고 image.png가 보이도록 수정 */
          }
          /* ✅ 홈페이지 제외 모든 페이지에서 세로 스크롤(스크롤링) 가능하도록 허용 */
          .auth-bg, .shop-theme, .mmp-page, .mmp-subpage, .mypage, .mypage-subpage, .rrp-page {
            background: transparent !important;
            height: 100vh !important;
            padding-bottom: 0 !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          /* ✅ 홈페이지와 냉장고 페이지는 전체화면 고정 (내부에서 자체 스크롤) */
          .app-bg, .fridge-page {
            background: transparent !important;
            height: 100vh !important;
            padding-bottom: 0 !important;
            overflow: hidden !important;
          }
          .fridge-page::after, .mypage::after, .mypage-subpage::after, .mmp-page::after, .mmp-subpage::after, .app-bg::after, .auth-bg::after, .shop-theme::after, .rrp-page::after {
            display: none !important;
          }
          footer, .footer, #footer {
            display: none !important;
          }
        `}
      </style>
      
      <Routes>
        {/* 메인 홈 */}
        <Route path="/" element={<Homepage />} />
        <Route path="/intro" element={<Homepage />} />
        <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

        {/* 일반 사용자 관련 */}
        <Route path="/user/login" element={<LoginPage role="USER" />} />
        <Route path="/user/register" element={<RegisterPage role="USER" />} />
        <Route path="/user/fridge" element={<FridgePage />} />
        <Route path="/user/mypage" element={<MyPage />} />
        
        {/* ✅ 마이페이지 확장 메뉴 라우트 */}
        <Route path="/user/stamp" element={<StampPage />} />
        <Route path="/user/report" element={<ReportPage />} />

        {/* AI 및 편의 기능 */}
        <Route path="/user/recipe-recommend" element={<RecipeRecommendPage />} />
        <Route path="/user/food-search" element={<FoodSearchPage />} />
        <Route path="/user/chatbot" element={<ChatbotPage />} />

        {/* 소상공인 관련 */}
        <Route path="/market/login" element={<MarketLoginPage role="SHOP" />} />
        <Route path="/market/register" element={<MarketRegisterPage role="SHOP" />} />
        <Route path="/market/main" element={<ShopPage role="SHOP" />} />
        <Route path="/market/mypage" element={<MarketMyPage />} />
        <Route path="/market/items" element={<ShopItemAddPage role="SHOP" />} />
        <Route path="/market/items/:id/sale" element={<ShopItemSalePage role="SHOP" />} />
        <Route path="/market/scan/:marketId" element={<QrScanPage />} />

        {/* 관리자 관련(황준호) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUserManagePage />} />
        <Route path="/admin/markets" element={<AdminMarketManagePage />} />
        <Route path="/admin/reports" element={<AdminReportManagePage />} />
        <Route path="/admin/notices" element={<AdminNoticeManagePage />} />
        <Route path="/admin/statistics" element={<AdminStatisticsPage />} />

        {/* 잘못된 주소로 들어오면 홈으로 */}
        <Route path="/*" element={<Homepage />} />
      </Routes>
    </>
  );
};

export default App;