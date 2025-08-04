// src/pages/Map/Map.jsx
import React, { useEffect, useRef } from "react";
import mapStyles from "./Map.module.css"; // Map 컴포넌트의 CSS Modules 스타일

export const MapPage = () => {
  const mapContainer = useRef(null); // 지도를 렌더링할 div의 ref

  useEffect(() => {
    // Kakao 지도 API 스크립트가 로드되었는지 확인
    // window.kakao와 window.kakao.maps 객체가 존재하는지 확인합니다.
    // 이 조건은 index.html의 스크립트 로드가 완료되었음을 보장합니다.
    if (window.kakao && window.kakao.maps) {
      const kakaoMaps = window.kakao.maps; // 전역 객체 참조

      // 지도를 표시할 div 엘리먼트
      const container = mapContainer.current;

      // 지도의 중심좌표. 여기서는 예시로 서울 시청의 좌표를 사용합니다.
      // 실제 서비스에서는 사용자의 현재 위치나 특정 장소의 좌표를 사용할 수 있습니다.
      const options = {
        center: new kakaoMaps.LatLng(37.566826, 126.9786567), // 서울 시청
        level: 3, // 지도의 확대 레벨
      };

      // 지도 객체를 생성합니다.
      const map = new kakaoMaps.Map(container, options);
      console.log("Kakao Map initialized successfully:", map);

      // 추가 기능: 마커 표시 예시
      const markerPosition = new kakaoMaps.LatLng(37.566826, 126.9786567);
      const marker = new kakaoMaps.Marker({
        position: markerPosition,
      });
      marker.setMap(map); // 마커를 지도에 표시

      // 컴포넌트 언마운트 시 지도 관련 리소스 정리 (선택 사항이지만 좋은 습관)
      return () => {
        // 필요에 따라 지도 인스턴스 정리 로직 추가
      };
    } else {
      console.warn("Kakao Maps SDK not loaded yet.");
    }
  }, []); // 빈 배열은 컴포넌트가 처음 마운트될 때만 실행됨을 의미

  return (
    <div className={mapStyles.mapPageContainer}>
      <div className={mapStyles.mapContentWrapper}>
        {/* 이 위에 지도 컨트롤 요소들이 들어갈 수 있습니다 (검색창, 버튼 등) */}
        {/* 이전 Map.jsx의 UI 요소들을 여기에 배치하면 됩니다. */}
        {/* 예를 들어: */}
        {/* <div className={mapStyles.headerSection}>...</div>
        <div className={mapStyles.searchContainer}>...</div> */}

        {/* 지도를 렌더링할 div 엘리먼트. 이 엘리먼트의 크기가 중요합니다. */}
        <div
          ref={mapContainer}
          id="kakao-map-container" // ID는 필수는 아니지만, 디버깅에 유용할 수 있습니다.
          className={mapStyles.mapContainer}
        />
      </div>
    </div>
  );
};

export default MapPage; // MapPage를 내보냅니다.
