// src/pages/Map/MapPage.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import "./MapPage.css";
import { useNavigate } from "react-router-dom";

// .env.local 에 VITE_KAKAO_REST_API_KEY=YOUR_REST_API_KEY
const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;

export const MapPage = () => {
  // 모드: 충전소 / 주변상권
  const [isChargerMode, setIsChargerMode] = useState(true);

  // 마커 클릭 시 표시할 상세 정보(값이 있으면 팝업 표시)
  const [selectedAmenityDetails, setSelectedAmenityDetails] = useState(null);

  // 충전소 필터 상태(현재 UI만, 실제 필터 적용은 추후)
  const [selectedChargerFilters, setSelectedChargerFilters] = useState([]);
  const [selectedSpeedFilters, setSelectedSpeedFilters] = useState([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  // 주변 상권 필터 상태
  const [selectedAmenityFilters, setSelectedAmenityFilters] = useState([]);

  // 검색어
  const [searchQuery, setSearchQuery] = useState("");

  // 지도 refs
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // 라우팅
  const navigate = useNavigate();

  // 리뷰 라우팅 & 존재 여부 체크
  const REVIEW_KEY = "review:station-green-energy";
  const REVIEW_VIEW_PATH = "/reviews/station-green-energy";

  const handleGoWriteReview = () => navigate("/review");
  const handleGoViewReview = () => {
    const exists = localStorage.getItem(REVIEW_KEY);
    if (!exists) {
      alert("리뷰가 없습니다");
      return;
    }
    navigate(REVIEW_VIEW_PATH);
  };

  // 마커 추가 + 클릭 리스너
  const addMarkers = useCallback((map, places) => {
    const kakaoMaps = window.kakao.maps;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    places.forEach((place) => {
      const markerPosition = new kakaoMaps.LatLng(place.y, place.x);
      const marker = new kakaoMaps.Marker({
        position: markerPosition,
        map,
      });

      kakaoMaps.event.addListener(marker, "click", () => {
        setSelectedAmenityDetails(place);
      });

      markersRef.current.push(marker);
    });
  }, []);

  // (데모) 충전소 데이터 로드
  const loadChargers = useCallback(
    (map) => {
      const chargers = [
        {
          x: "126.9230",
          y: "37.5802",
          place_name: "명지대학교 인문캠퍼스 충전소",
          road_address_name: "서울특별시 서대문구 거북골로 34",
          category_name: "충전소",
          phone: "02-300-1515",
          place_url: "https://www.mju.ac.kr",
        },
        {
          x: "127.02763",
          y: "37.49794",
          place_name: "강남역 충전소",
          // 빈 필드가 있을 수 있으므로 팝업에서 안전 처리
        },
      ];
      addMarkers(map, chargers);
    },
    [addMarkers]
  );

  // 주변 상권 로드(카카오 로컬 API)
  const loadAmenities = useCallback(
    (map) => {
      if (!KAKAO_REST_API_KEY) {
        console.error("카카오 REST API 키가 설정되지 않았습니다.");
        return;
      }
      const kakaoMaps = window.kakao.maps;
      const center = map.getCenter();
      const y = center.getLat();
      const x = center.getLng();

      const selectedAmenity = selectedAmenityFilters[0] || "카페";
      const categoryGroupCode = {
        식당: "FD6",
        카페: "CE7",
        공원: "AT4",
        쇼핑: "MT1",
      }[selectedAmenity];

      if (!categoryGroupCode) {
        addMarkers(map, []);
        return;
      }

      const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${categoryGroupCode}&x=${x}&y=${y}&radius=1000&size=15`;

      fetch(url, {
        method: "GET",
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.documents) {
            // Kakao API는 x=lng, y=lat 문자열 제공
            addMarkers(map, data.documents);
          }
        })
        .catch((e) => {
          console.error("카카오 로컬 API 호출 중 오류:", e);
        });
    },
    [KAKAO_REST_API_KEY, selectedAmenityFilters, addMarkers]
  );

  // 주소 검색
  const handleSearch = () => {
    if (!searchQuery) return;

    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
      searchQuery
    )}`;

    fetch(url, {
      method: "GET",
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.documents && data.documents.length > 0) {
          const first = data.documents[0];
          const newPos = new window.kakao.maps.LatLng(first.y, first.x);
          mapInstance.current.setCenter(newPos);
        } else {
          alert("검색 결과가 없습니다.");
        }
      })
      .catch((e) => console.error("주소 검색 오류:", e));
  };

  // 지도 초기화
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.warn("Kakao Maps SDK not loaded yet.");
      return;
    }

    const kakaoMaps = window.kakao.maps;
    const container = mapContainerRef.current;

    const options = {
      center: new kakaoMaps.LatLng(37.5802, 126.923),
      level: 3,
    };

    mapInstance.current = new kakaoMaps.Map(container, options);

    const handleMapModeChange = () => {
      if (isChargerMode) {
        loadChargers(mapInstance.current);
      } else {
        loadAmenities(mapInstance.current);
      }
    };

    const handleMapDragend = () => {
      if (!isChargerMode) {
        loadAmenities(mapInstance.current);
      }
    };

    handleMapModeChange();
    kakaoMaps.event.addListener(
      mapInstance.current,
      "dragend",
      handleMapDragend
    );

    return () => {
      kakaoMaps.event.removeListener(
        mapInstance.current,
        "dragend",
        handleMapDragend
      );
    };
  }, [isChargerMode, selectedAmenityFilters, loadChargers, loadAmenities]);

  // 필터 토글
  const toggleFilter = (filters, setFilters, value) => {
    if (filters.includes(value)) setFilters([]);
    else setFilters([value]);
  };

  // 팝업 닫기
  const handleClosePopup = () => setSelectedAmenityDetails(null);

  return (
    <div className="map-page-container">
      {/* 지도 */}
      <div
        ref={mapContainerRef}
        id="kakao-map-container"
        className="kakao-map-container"
      />

      {/* 헤더(검색/모드 토글) */}
      <div className="header-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="목적지 검색 (예: 서울특별시 강남구)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-button" onClick={handleSearch}>
            <span className="material-icons">search</span>
          </button>
        </div>

        <div className="filter-toggle-buttons">
          <button
            className={`filter-button ${isChargerMode ? "active" : ""}`}
            onClick={() => setIsChargerMode(true)}
          >
            <span className="material-icons" />
            충전소
          </button>
          <button
            className={`filter-button ${!isChargerMode ? "active" : ""}`}
            onClick={() => setIsChargerMode(false)}
          >
            <span className="material-icons" />
            주변 상권
          </button>
        </div>
      </div>

      {/* 필터 사이드바 */}
      <div className="filter-sidebar">
        <h3 className="filter-title">
          {isChargerMode ? "충전소 필터" : "주변 상권 필터"}
        </h3>

        {isChargerMode ? (
          <div className="charger-filters">
            <div>
              <label className="filter-label">커넥터 종류</label>
              <div className="filter-options">
                {["DC콤보", "차데모", "AC3상"].map((type) => (
                  <button
                    key={type}
                    className={`filter-option-button ${
                      selectedChargerFilters.includes(type) ? "selected" : ""
                    }`}
                    onClick={() =>
                      toggleFilter(
                        selectedChargerFilters,
                        setSelectedChargerFilters,
                        type
                      )
                    }
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="filter-label">충전 속도</label>
              <div className="filter-options">
                {["급속 (50kW+)", "완속"].map((speed) => (
                  <button
                    key={speed}
                    className={`filter-option-button ${
                      selectedSpeedFilters.includes(speed) ? "selected" : ""
                    }`}
                    onClick={() =>
                      toggleFilter(
                        selectedSpeedFilters,
                        setSelectedSpeedFilters,
                        speed
                      )
                    }
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                />
                <span className="checkbox-text">사용 가능한 충전기만</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="amenity-filters">
            <div className="filter-options">
              {["식당", "카페", "공원", "쇼핑"].map((amenity) => (
                <button
                  key={amenity}
                  className={`filter-option-button ${
                    selectedAmenityFilters.includes(amenity) ? "selected" : ""
                  }`}
                  onClick={() =>
                    toggleFilter(
                      selectedAmenityFilters,
                      setSelectedAmenityFilters,
                      amenity
                    )
                  }
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 팝업 */}
      {selectedAmenityDetails && (
        <div
          className={`popup-container ${selectedAmenityDetails ? "open" : ""}`}
        >
          <div className="popup-handle" onClick={handleClosePopup} />
          <div className="popup-content">
            <div className="amenity-details">
              <div className="popup-header">
                <div>
                  <h2 className="popup-title">
                    {selectedAmenityDetails.place_name || "이름 정보 없음"}
                  </h2>
                  <p className="popup-subtitle">
                    {selectedAmenityDetails.road_address_name ||
                      "주소 정보 없음"}
                  </p>
                </div>
                <button className="close-button" onClick={handleClosePopup}>
                  <span className="material-icons">close</span>
                </button>
              </div>

              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuABzEvDttHWWFB1YjYOM3IFBPdWVNvrulJY3a1ct9raQH0TfF4XDWqL9375hcGetFnn2hqTJVTyN6YGqkw1vjbPMeWEhnlAZSHqe-tzOU4GNiu4jzmeat3H_dH708JAdXmt5XyGRbCNNUvNGweNh2Dzb1Jg8wmZfTHK4bqXO5R50Hv3hlzqL6yXLItcNWwSaGRKx_J89ifej6T3cnVOh9ptexXy_sc_KOt4eFQwfV5j3tXS1dC4fzt1ohy6hFNlWKJxA-b1sMrffwf8"
                alt={`${selectedAmenityDetails.place_name || ""} 사진`}
                className="amenity-image"
              />

              <div className="amenity-info-grid">
                <div className="amenity-info-item">
                  <p className="info-label">카테고리</p>
                  <p className="info-value">
                    {selectedAmenityDetails.category_name
                      ? selectedAmenityDetails.category_name.split(" > ").pop()
                      : "정보 없음"}
                  </p>
                </div>
                <div className="amenity-info-item">
                  <p className="info-label">전화번호</p>
                  <p className="info-value">
                    {selectedAmenityDetails.phone || "정보 없음"}
                  </p>
                </div>
                <div className="amenity-info-item">
                  <p className="info-label">운영 시간</p>
                  <p className="info-value">정보 없음</p>
                </div>
                <div className="amenity-info-item">
                  <p className="info-label">홈페이지</p>
                  <p className="info-value">
                    {selectedAmenityDetails.place_url ? (
                      <a
                        href={selectedAmenityDetails.place_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        홈페이지 바로가기
                      </a>
                    ) : (
                      "정보 없음"
                    )}
                  </p>
                </div>
              </div>

              <button className="recommend-button">
                <span className="material-icons">thumb_up</span> 추천해요
              </button>

              {/* 리뷰 작성 / 보기 버튼 */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                  width: "100%",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={handleGoWriteReview}
                  style={{
                    flex: "1 1 140px",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #e5e8ea",
                    background: "#00C2AD",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  리뷰 작성
                </button>

                <button
                  type="button"
                  onClick={handleGoViewReview}
                  style={{
                    flex: "1 1 140px",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #e5e8ea",
                    background: "#e8edf4",
                    color: "#111416",
                    cursor: "pointer",
                  }}
                >
                  리뷰 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
