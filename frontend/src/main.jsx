import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Routes, Route 추가

import FridgePage from './pages/FridgePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import UserPage from './pages/UserPage.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes> {/* 이제 에러 없이 작동합니다 */}
        <Route path="/" element={<App />} /> {/* 메인 홈 추가 */}
        <Route path="/intro" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/user">
          <Route index element={<UserPage />} />
          <Route path="fridge" element={<FridgePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
