// src/pages/Map/MapPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./MapPage.css";
import { useNavigate } from "react-router-dom";

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;

export const MapPage = () => {
  const [isChargerMode, setIsChargerMode] = useState(true);
  const [selectedAmenityDetails, setSelectedAmenityDetails] = useState(null);
  const [selectedChargerFilters, setSelectedChargerFilters] = useState([]);
  const [selectedSpeedFilters, setSelectedSpeedFilters] = useState([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedAmenityFilters, setSelectedAmenityFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const navigate = useNavigate();

  // ==== (중요) 장소별 ID/메타 유틸 ====
  const slugify = (s) =>
    String(s || "unknown")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
  const getPlaceId = (p) =>
    p?.id ? String(p.id) : "charger-" + slugify(p?.place_name);
  const getPlaceName = (p) => p?.place_name || "이름 정보 없음";
  const getPlaceAddr = (p) =>
    p?.road_address_name || p?.address_name || "주소 정보 없음";
  const savePlaceMeta = (p) => {
    const placeId = getPlaceId(p);
    localStorage.setItem(
      `place:${placeId}`,
      JSON.stringify({ name: getPlaceName(p), addr: getPlaceAddr(p) })
    );
    return placeId;
  };

  // 지도에 마커 찍기
  const addMarkers = useCallback((map, places) => {
    const kakao = window.kakao.maps;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    places.forEach((place) => {
      const lat = Number(place.y),
        lng = Number(place.x);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;
      const marker = new kakao.Marker({
        position: new kakao.LatLng(lat, lng),
        map,
      });
      kakao.event.addListener(marker, "click", () =>
        setSelectedAmenityDetails(place)
      );
      markersRef.current.push(marker);
    });
  }, []);

  // 데모 충전소
  const loadChargers = useCallback(
    (map) => {
      addMarkers(map, [
        {
          id: "charger-mju",
          x: "126.9230",
          y: "37.5802",
          place_name: "명지대학교 인문캠퍼스 충전소",
          road_address_name: "서울특별시 서대문구 거북골로 34",
          category_name: "충전소",
          phone: "02-300-1515",
          place_url: "https://www.mju.ac.kr",
        },
        {
          id: "charger-gangnam",
          x: "127.02763",
          y: "37.49794",
          place_name: "강남역 충전소",
          road_address_name: "서울특별시 강남구 강남대로",
        },
      ]);
    },
    [addMarkers]
  );

  // 주변 상권 (카카오 API)
  const loadAmenities = useCallback(
    (map) => {
      if (!KAKAO_REST_API_KEY) return console.error("카카오 키가 없습니다.");
      const center = map.getCenter();
      const y = center.getLat(),
        x = center.getLng();
      const selected = selectedAmenityFilters[0] || "카페";
      const code = { 식당: "FD6", 카페: "CE7", 공원: "AT4", 쇼핑: "MT1" }[
        selected
      ];
      if (!code) return addMarkers(map, []);
      fetch(
        `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${code}&x=${x}&y=${y}&radius=1000&size=15`,
        {
          headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
        }
      )
        .then((r) => r.json())
        .then((d) => d.documents && addMarkers(map, d.documents))
        .catch((e) => console.error(e));
    },
    [KAKAO_REST_API_KEY, selectedAmenityFilters, addMarkers]
  );

  // 주소 검색
  const handleSearch = () => {
    if (!searchQuery) return;
    fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
        searchQuery
      )}`,
      {
        headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
      }
    )
      .then((r) => r.json())
      .then((d) => {
        if (!d.documents?.length) return alert("검색 결과가 없습니다.");
        const first = d.documents[0];
        mapInstance.current.setCenter(
          new window.kakao.maps.LatLng(first.y, first.x)
        );
      });
  };

  // 지도 초기화
  useEffect(() => {
    if (!window.kakao?.maps) return;
    const kakao = window.kakao.maps;
    mapInstance.current = new kakao.Map(mapContainerRef.current, {
      center: new kakao.LatLng(37.5802, 126.923),
      level: 3,
    });
    const refresh = () =>
      isChargerMode
        ? loadChargers(mapInstance.current)
        : loadAmenities(mapInstance.current);
    const onDragEnd = () =>
      !isChargerMode && loadAmenities(mapInstance.current);
    refresh();
    kakao.event.addListener(mapInstance.current, "dragend", onDragEnd);
    return () =>
      kakao.event.removeListener(mapInstance.current, "dragend", onDragEnd);
  }, [isChargerMode, selectedAmenityFilters, loadChargers, loadAmenities]);

  const toggleFilter = (filters, setFilters, v) =>
    filters.includes(v) ? setFilters([]) : setFilters([v]);
  const handleClosePopup = () => setSelectedAmenityDetails(null);

  // (핵심) 팝업 버튼: 장소별 작성/보기
  const handleWriteForSelected = () => {
    const pid = savePlaceMeta(selectedAmenityDetails);
    navigate(`/review/new/${pid}`);
  };
  const handleListForSelected = () => {
    const pid = savePlaceMeta(selectedAmenityDetails);
    const list = JSON.parse(localStorage.getItem(`reviews:${pid}`) || "[]");
    if (!list.length) return alert("리뷰가 없습니다");
    navigate(`/reviews/${pid}`);
  };

  // ===== 우측 상단 메뉴(FAB) =====
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <div className="map-page-container">
      {/* 지도 */}
      <div
        ref={mapContainerRef}
        id="kakao-map-container"
        className="kakao-map-container"
      />

      {/* 헤더 */}
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
            <span>search</span>
          </button>
        </div>

        <div className="filter-toggle-buttons">
          <button
            className={`filter-button ${isChargerMode ? "active" : ""}`}
            onClick={() => setIsChargerMode(true)}
          >
            충전소
          </button>
          <button
            className={`filter-button ${!isChargerMode ? "active" : ""}`}
            onClick={() => setIsChargerMode(false)}
          >
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
                {["DC콤보", "차데모", "AC3상"].map((t) => (
                  <button
                    key={t}
                    className={`filter-option-button ${
                      selectedChargerFilters.includes(t) ? "selected" : ""
                    }`}
                    onClick={() =>
                      toggleFilter(
                        selectedChargerFilters,
                        setSelectedChargerFilters,
                        t
                      )
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="filter-label">충전 속도</label>
              <div className="filter-options">
                {["급속 (50kW+)", "완속"].map((s) => (
                  <button
                    key={s}
                    className={`filter-option-button ${
                      selectedSpeedFilters.includes(s) ? "selected" : ""
                    }`}
                    onClick={() =>
                      toggleFilter(
                        selectedSpeedFilters,
                        setSelectedSpeedFilters,
                        s
                      )
                    }
                  >
                    {s}
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
              {["식당", "카페", "공원", "쇼핑"].map((a) => (
                <button
                  key={a}
                  className={`filter-option-button ${
                    selectedAmenityFilters.includes(a) ? "selected" : ""
                  }`}
                  onClick={() =>
                    toggleFilter(
                      selectedAmenityFilters,
                      setSelectedAmenityFilters,
                      a
                    )
                  }
                >
                  {a}
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
                    {getPlaceName(selectedAmenityDetails)}
                  </h2>
                  <p className="popup-subtitle">
                    {getPlaceAddr(selectedAmenityDetails)}
                  </p>
                </div>
                <button className="close-button" onClick={handleClosePopup}>
                  <span className="material-icons">close</span>
                </button>
              </div>

              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuABzEvDttHWWFB1YjYOM3IFBPdWVNvrulJY3a1ct9raQH0TfF4XDWqL9375hcGetFnn2hqTJVTyN6YGqkw1vjbPMeWEhnlAZSHqe-tzOU4GNiu4jzmeat3H_dH708JAdXmt5XyGRbCNNUvNGweNh2Dzb1Jg8wmZfTHK4bqXO5R50Hv3hlzqL6yXLItcNWwSaGRKx_J89ifej6T3cnVOh9ptexXy_sc_KOt4eFQwfV5j3tXS1dC4fzt1ohy6hFNlWKJxA-b1sMrffwf8"
                alt={`${getPlaceName(selectedAmenityDetails)} 사진`}
                className="amenity-image"
              />

              <div className="amenity-info-grid">
                <div className="amenity-info-item">
                  <p className="info-label">카테고리</p>
                  <p className="info-value">
                    {selectedAmenityDetails?.category_name
                      ? selectedAmenityDetails.category_name.split(" > ").pop()
                      : "정보 없음"}
                  </p>
                </div>
                <div className="amenity-info-item">
                  <p className="info-label">전화번호</p>
                  <p className="info-value">
                    {selectedAmenityDetails?.phone || "정보 없음"}
                  </p>
                </div>
                <div className="amenity-info-item">
                  <p className="info-label">운영 시간</p>
                  <p className="info-value">정보 없음</p>
                </div>
                <div className="amenity-info-item">
                  <p className="info-label">홈페이지</p>
                  <p className="info-value">
                    {selectedAmenityDetails?.place_url ? (
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

              {/* 리뷰 작성 / 보기 */}
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
                  onClick={handleWriteForSelected}
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
                  onClick={handleListForSelected}
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

      {/* 우측 상단 메뉴(FAB) */}
      <div className="menu-fab" ref={menuRef}>
        <button
          type="button"
          className="menu-button"
          aria-label="메뉴"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="menu-bars" aria-hidden="true">
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </span>
        </button>
        {menuOpen && (
          <div className="menu-dropdown">
            <button
              type="button"
              className="menu-item-button"
              onClick={() => {
                setMenuOpen(false);
                navigate("/");
              }}
            >
              홈페이지
            </button>
            <button
              type="button"
              className="menu-item-button"
              onClick={() => {
                setMenuOpen(false);
                navigate("/mypage");
              }}
            >
              마이페이지
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
