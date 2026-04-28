import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx"; // 모든 경로는 App.jsx에서 관리할 겁니다.

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <BrowserRouter>
      <App /> {/* 👈 복잡한 지도는 App 컴포넌트가 그립니다. */}
    </BrowserRouter>
  // </StrictMode>
);