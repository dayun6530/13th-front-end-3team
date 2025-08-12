// src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/Home/Home";
import { MyPage } from "./pages/MyPage/MyPage";
import { ReviewPage } from "./pages/Review/Review";
import { MapPage } from "./pages/Map/MapPage";
import { VehicleRegistrationForm } from "./pages/VehicleRegistration/VehicleRegistrationForm";
import "./components/GlobalStyles/GlobalStyles.css";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/register-vehicle" element={<VehicleRegistrationForm />} />
      </Routes>
    </Router>
  );
}

export default App;
