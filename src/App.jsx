// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/Home/Home";
import { MyPage } from "./pages/MyPage/MyPage";
import { MapPage } from "./pages/Map/MapPage";
import { ReviewPage } from "./pages/Review/Review"; // 작성
import { ReviewListPage } from "./pages/Review/ReviewList"; // 목록
import { ReviewDetailPage } from "./pages/Review/ReviewDetail"; // 상세
import { VehicleRegistrationForm } from "./pages/VehicleRegistration/VehicleRegistrationForm";
import "./components/GlobalStyles/GlobalStyles.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/mypage" element={<MyPage />} />

        {/* 장소별 리뷰 흐름 */}
        <Route path="/review/new/:placeId" element={<ReviewPage />} />
        <Route path="/reviews/:placeId" element={<ReviewListPage />} />
        <Route
          path="/reviews/:placeId/:reviewId"
          element={<ReviewDetailPage />}
        />

        {/* 예전 경로가 필요하면 유지 */}
        <Route path="/register-vehicle" element={<VehicleRegistrationForm />} />
      </Routes>
    </Router>
  );
}
export default App;
