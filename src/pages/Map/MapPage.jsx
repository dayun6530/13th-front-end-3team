// src/pages/Map/MapPage.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import "./MapPage.css";

// .env.local 파일에 VITE_KAKAO_REST_API_KEY=YOUR_REST_API_KEY 형태로 저장해야 합니다.
const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;

export const MapPage = () => {
  const [isChargerMode, setIsChargerMode] = useState(true);
  // 기존 isPopupOpen 상태 대신, 상세 정보 상태가 null이 아니면 팝업을 엽니다.
  // const [isPopupOpen, setIsPopupOpen] = useState(false);
  // const [selectedPopup, setSelectedPopup] = useState(null);

  // === 수정된 부분: 마커 클릭 시 상세 정보를 담을 새로운 상태 추가 ===
  const [selectedAmenityDetails, setSelectedAmenityDetails] = useState(null);
  // =================================================================

  // 충전소 필터 상태
  const [selectedChargerFilters, setSelectedChargerFilters] = useState([]);
  const [selectedSpeedFilters, setSelectedSpeedFilters] = useState([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  // 주변 상권 필터 상태
  const [selectedAmenityFilters, setSelectedAmenityFilters] = useState([]);

  const [rating, setRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // 마커를 지도에 표시하고 클릭 이벤트를 연결하는 함수
  const addMarkers = useCallback((map, places, type) => {
    const kakaoMaps = window.kakao.maps;

    // 기존 마커 모두 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    places.forEach((place) => {
      const markerPosition = new kakaoMaps.LatLng(place.y, place.x);
      const marker = new kakaoMaps.Marker({
        position: markerPosition,
        map: map,
        // 커스텀 마커 이미지 설정 가능
      });

      // === 수정된 부분: 마커 클릭 시 해당 장소의 상세 정보를 상태에 저장 ===
      kakaoMaps.event.addListener(marker, "click", () => {
        // 기존 setSelectedPopup(type) 대신 place 객체 전체를 저장합니다.
        setSelectedAmenityDetails(place);
      });
      // =================================================================

      markersRef.current.push(marker);
    });
  }, []);

  // 충전소 데이터 로드 (가상 데이터)
  const loadChargers = useCallback(
    (map) => {
      // 실제로는 충전소 데이터를 불러오는 API 호출 로직이 들어갑니다.
      // TODO: 충전소 API 연동
      const chargers = [
        {
          x: "126.9230",
          y: "37.5802",
          place_name: "명지대학교 인문캠퍼스 충전소",
          road_address_name: "서울특별시 서대문구 거북골로 34", // 주소 추가
          category_name: "충전소", // 카테고리 추가
          phone: "02-300-1515", // 전화번호 추가
          place_url: "https://www.mju.ac.kr", // 홈페이지 URL 추가
        },

        { x: "127.02763", y: "37.49794", place_name: "강남역 충전소" },
      ];
      addMarkers(map, chargers, "charger");
    },
    [addMarkers]
  );

  // 주변 상권 데이터 로드 (카카오 로컬 API 호출)
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

      // === 수정된 부분: 필터가 여러 개일 경우를 고려할 수 있도록 수정 (현재는 첫 번째 필터만 사용) ===
      const selectedAmenity = selectedAmenityFilters[0] || "카페"; // 필터가 없을 경우 기본값
      // =======================================================================================
      const categoryGroupCode = {
        식당: "FD6",
        카페: "CE7",
        공원: "AT4", // 관광명소로 대체
        쇼핑: "MT1", // 대형마트로 대체
      }[selectedAmenity];

      if (!categoryGroupCode) {
        addMarkers(map, [], "amenity");
        return;
      }

      const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${categoryGroupCode}&x=${x}&y=${y}&radius=1000&size=15`;

      fetch(url, {
        method: "GET",
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.documents) {
            addMarkers(map, data.documents, "amenity");
          }
        })
        .catch((error) => {
          console.error("카카오 로컬 API 호출 중 오류 발생:", error);
        });
    },
    [KAKAO_REST_API_KEY, selectedAmenityFilters, addMarkers]
  );

  // 주소 검색 처리 함수
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
      .then((response) => response.json())
      .then((data) => {
        if (data.documents && data.documents.length > 0) {
          const firstResult = data.documents[0];
          const newPos = new window.kakao.maps.LatLng(
            firstResult.y,
            firstResult.x
          );
          mapInstance.current.setCenter(newPos);
        } else {
          alert("검색 결과가 없습니다.");
        }
      })
      .catch((error) => {
        console.error("주소 검색 API 호출 중 오류 발생:", error);
      });
  };

  // 지도 초기화 및 마커 관리를 위한 useEffect
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
  }, [isChargerMode, selectedAmenityFilters, loadChargers, loadAmenities]); // 의존성 배열에 상태와 함수 추가

  // 필터 토글 함수
  const toggleFilter = (filters, setFilters, value) => {
    if (filters.includes(value)) {
      setFilters([]);
    } else {
      setFilters([value]);
    }
  };

  // === 수정된 부분: 팝업을 닫는 함수 수정 ===
  const handleClosePopup = () => {
    setSelectedAmenityDetails(null); // 상태를 null로 변경하여 팝업을 닫습니다.
  };
  // ===========================================

  return (
    <div className="map-page-container">
      <div
        ref={mapContainerRef}
        id="kakao-map-container"
        className="kakao-map-container"
      ></div>

      {/* Header (Search and Toggles) */}
      <div className="header-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="목적지 검색 (예: 서울특별시 강남구)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
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
            <span className="material-icons"></span> 충전소
          </button>
          <button
            className={`filter-button ${!isChargerMode ? "active" : ""}`}
            onClick={() => setIsChargerMode(false)}
          >
            <span className="material-icons"></span> 주변 상권
          </button>
        </div>
      </div>

      {/* Filters Sidebar */}
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

      {/* === 수정된 부분: 팝업 컴포넌트 JSX === */}
      {/* selectedAmenityDetails 상태에 값이 있을 경우에만 팝업을 표시합니다. */}
      {selectedAmenityDetails && (
        <div
          className={`popup-container ${selectedAmenityDetails ? "open" : ""}`}
        >
          <div className="popup-handle" onClick={handleClosePopup}></div>
          <div className="popup-content">
            <div className="amenity-details">
              <div className="popup-header">
                <div>
                  {/* API에서 받은 place_name으로 제목을 설정 */}
                  <h2 className="popup-title">
                    {selectedAmenityDetails.place_name}
                  </h2>
                  {/* API에서 받은 road_address_name으로 주소를 설정 */}
                  <p className="popup-subtitle">
                    {selectedAmenityDetails.road_address_name}
                  </p>
                </div>
                <button className="close-button" onClick={handleClosePopup}>
                  <span className="material-icons">close</span>
                </button>
              </div>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuABzEvDttHWWFB1YjYOM3IFBPdWVNvrulJY3a1ct9raQH0TfF4XDWqL9375hcGetFnn2hqTJVTyN6YGqkw1vjbPMeWEhnlAZSHqe-tzOU4GNiu4jzmeat3H_dH708JAdXmt5XyGRbCNNUvNGweNh2Dzb1Jg8wmZfTHK4bqXO5R50Hv3hlzqL6yXLItcNWwSaGRKx_J89ifej6T3cnVOh9ptexXy_sc_KOt4eFQwfV5j3tXS1dC4fzt1ohy6hFNlWKJxA-b1sMrffwf8"
                alt={`${selectedAmenityDetails.place_name} 사진`}
                className="amenity-image"
              />
              <div className="amenity-info-grid">
                <div className="amenity-info-item">
                  <p className="info-label">카테고리</p>
                  <p className="info-value">
                    {selectedAmenityDetails.category_name.split(" > ").pop()}
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
                  <p className="info-value">정보 없음</p>{" "}
                  {/* API 응답에 운영 시간이 없으므로 임시로 '정보 없음'으로 설정 */}
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
            </div>
          </div>
        </div>
      )}
      {/* ========================================================= */}
    </div>
  );
};
