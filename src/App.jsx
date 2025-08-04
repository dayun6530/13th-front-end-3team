import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/Home/Home";
import { MyPage } from "./pages/MyPage/MyPage";
import { ReviewPage } from "./pages/Review/Review";
import { MapPage } from "./pages/Map/Map";
import { VehicleRegistrationForm } from "./pages/VehicleRegistration/VehicleRegistrationForm";
import "./components/GlobalStyles/GlobalStyles.css"; // 전역 스타일 임포트

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route
          path="/register-vehicle"
          element={<VehicleRegistrationForm />}
        />{" "}
        {/* <--- This line is crucial */}
        {/* 필요한 다른 경로들을 여기에 추가할 수 있습니다 */}
      </Routes>
    </Router>
  );
}

export default App;
