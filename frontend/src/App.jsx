import React from "react";
import { Routes, Route } from "react-router-dom";

// 공통 및 사용자 관련
// import OAuth2CallbackPage from './pages/auth/OAuth2CallbackPage';
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
import QrScanPage from "./pages/user/QrScanPage";

// 관리자 관련
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUserManagePage from "./pages/admin/AdminUserManagePage";
import AdminMarketManagePage from "./pages/admin/AdminMarketManagePage";
import AdminReportManagePage from "./pages/admin/AdminReportManagePage";
import AdminNoticeManagePage from "./pages/admin/AdminNoticeManagePage";
import AdminStatisticsPage from "./pages/admin/AdminStatisticsPage";
import ProtectedRoute from "./pages/admin/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      {/* 메인 홈 */}
      <Route path="/" element={<Homepage />} />
      <Route path="/intro" element={<Homepage />} />
      {/* <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} /> */}

      {/* 일반 사용자 관련 */}
      <Route path="/user/login" element={<LoginPage role="USER" />} />
      <Route path="/user/register" element={<RegisterPage role="USER" />} />
      <Route path="/user/fridge" element={<FridgePage />} />
      <Route path="/user/mypage" element={<MyPage />} />

      {/* ✅ 마이페이지 확장 메뉴 라우트 */}
      <Route path="/user/stamp" element={<StampPage />} />
      <Route path="/user/report" element={<ReportPage />} />
      {/* <Route path="/user/coupons" element={<CouponPage />} /> */}
      {/* <Route path="/user/local-currency" element={<CurrencyPage />} /> */}

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

      {/* 🔐 관리자 관련 (보안 강화 버전) - 황준호 */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AdminUserManagePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/markets"
        element={
          <ProtectedRoute>
            <AdminMarketManagePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <AdminReportManagePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notices"
        element={
          <ProtectedRoute>
            <AdminNoticeManagePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/statistics"
        element={
          <ProtectedRoute>
            <AdminStatisticsPage />
          </ProtectedRoute>
        }
      />

      {/* 잘못된 주소로 들어오면 홈으로 */}
      <Route path="/*" element={<Homepage />} />
    </Routes>
  );
};

export default App;
