// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MyPage } from "./pages/MyPage/MyPage";
import { MapPage } from "./pages/Map/MapPage";
import { ReviewPage } from "./pages/Review/Review"; // 작성
import { ReviewListPage } from "./pages/Review/ReviewList"; // 목록
import { ReviewDetailPage } from "./pages/Review/ReviewDetail"; // 상세
import "./components/GlobalStyles/GlobalStyles.css";

function App() {
  // ✅ 데모용 리뷰 5개를 특정 장소(charger-mju)에만 주입
  useEffect(() => {
    const placeId = "charger-mju";
    const placeMetaKey = `place:${placeId}`;
    const reviewsKey = `reviews:${placeId}`;

    const meta = JSON.parse(localStorage.getItem(placeMetaKey) || "null");
    if (!meta) {
      localStorage.setItem(
        placeMetaKey,
        JSON.stringify({
          name: "명지대학교 인문캠퍼스 충전소",
          addr: "서울특별시 서대문구 거북골로 34",
        })
      );
    }

    const existed = JSON.parse(localStorage.getItem(reviewsKey) || "[]");
    if (Array.isArray(existed) && existed.length > 0) return;

    const now = Date.now();
    const demoReviews = [
      {
        id: 101,
        // 🔴 [별점 제거] rating 필드 삭제
        recommend: true,
        text: "충전 속도 빠르고, 주차공간도 넉넉했어요. 안내 표지도 잘 되어 있어서 처음 방문해도 헷갈리지 않았습니다.",
        // ✅ 사진 배열 추가 (임시 이미지 URL)
        photos: [
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
          "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
        ],
        createdAt: now - 1000 * 60 * 60 * 2, // 2시간 전
      },
      {
        id: 102,
        recommend: true,
        text: "주말 오후에 갔는데 대기 없이 바로 충전했습니다. 주변에 카페가 있어서 기다리는 동안 쉬기 좋아요.",
        photos: [],
        createdAt: now - 1000 * 60 * 60 * 5, // 5시간 전
      },
      {
        id: 103,
        recommend: false,
        text: "충전은 무난했지만 결제 단말이 가끔 인식이 잘 안됐어요. 안내 문구가 좀 더 친절했으면 합니다.",
        photos: [
          "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
        ],
        createdAt: now - 1000 * 60 * 60 * 24, // 하루 전
      },
      {
        id: 104,
        recommend: true,
        text: "야간에도 조명이 밝아서 안전하게 이용했습니다. 관리 상태도 좋은 편이고 재방문 의사 있어요!",
        photos: [
          "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=800&q=80",
          "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80",
          "https://images.unsplash.com/photo-1549921296-3b4a4f7b2d3d?w=800&q=80",
        ],
        createdAt: now - 1000 * 60 * 60 * 36, // 1.5일 전
      },
      {
        id: 105,
        recommend: false,
        text: "주변 도로 공사 중이라 진입이 조금 복잡했습니다. 낮 시간대에는 차량이 몰려서 대기 발생했어요.",
        photos: [],
        createdAt: now - 1000 * 60 * 60 * 48, // 2일 전
      },
    ];

    localStorage.setItem(reviewsKey, JSON.stringify(demoReviews));
  }, []);

  return (
    <Router>
      <Routes>
        {/* 홈을 지도 페이지로 */}
        <Route path="/" element={<MapPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/mypage" element={<MyPage />} />

        {/* 장소별 리뷰 흐름 */}
        <Route path="/review/new/:placeId" element={<ReviewPage />} />
        <Route path="/reviews/:placeId" element={<ReviewListPage />} />
        <Route
          path="/reviews/:placeId/:reviewId"
          element={<ReviewDetailPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
