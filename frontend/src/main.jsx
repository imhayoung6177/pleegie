import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

// 컴포넌트 임포트
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import UserPage from "./pages/UserPage.jsx";
import FridgePage from "./pages/FridgePage.jsx";
import MerchantPage from "./pages/MerchantPage.jsx"; // 상인 메인 페이지 예시

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ── [공통] 메인 및 냉장고 선택 ── */}
        <Route path="/" element={<App />} />
        <Route path="/intro" element={<App />} />

        {/* ── [회원 전용 경로] ── */}
        <Route path="/login" element={<LoginPage role="USER" />} />
        <Route path="/register" element={<RegisterPage role="USER" />} />

        {/* 회원 기능 (중첩 라우팅) */}
        <Route path="/user">
          <Route index element={<UserPage />} />
          <Route path="mypage" element={<div>회원 마이페이지</div>} />
          <Route path="fridge" element={<FridgePage />} />
          <Route path="recipe" element={<div>레시피 추천</div>} />
          <Route path="menu" element={<div>메뉴 선정</div>} />
          <Route path="qr" element={<div>방문 인증 QR</div>} />
          <Route path="report" element={<div>신고하기</div>} />
        </Route>

        {/* ── [소상공인 전용 경로] ── */}
        {/*  role="SHOP"을 넘겨줘야 화면의 글자가 '소상공인'으로 바뀝니다! */}
        <Route path="/shop/login" element={<LoginPage role="SHOP" />} />
        <Route path="/shop/register" element={<RegisterPage role="SHOP" />} />

        {/* 소상공인 기능 */}
        <Route path="/shop/dashboard" element={<MerchantPage />} />
        <Route path="/shop/mypage" element={<div>기업 정보 수정</div>} />
        <Route path="/shop/qr" element={<div>상인용 QR 생성</div>} />
        <Route path="/shop/ingredients" element={<div>품목 등록</div>} />
        <Route path="/shop/report" element={<div>신고하기 기능</div>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
