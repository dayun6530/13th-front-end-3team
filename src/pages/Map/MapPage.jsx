// src/pages/Map/MapPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./MapPage.css";
import { useNavigate } from "react-router-dom";
// 1. axios 인스턴스를 가져옵니다.
import api from "../../api/axios";

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;

// 2. API 연동을 위한 충전기 타입과 코드 매핑
const CHARGER_TYPE_FILTERS = [
  "DC콤보",
  "차데모",
  "AC3상",
  "DC차데모",
  "J1772(완속)",
  "데스티네이션",
  "슈퍼차저",
];

const chargerFilterToCode = {
  DC콤보: "01",
  차데모: "03",
  AC3상: "06",
  DC차데모: "02",
  "J1772(완속)": "05",
  데스티네이션: "04",
  슈퍼차저: "07",
};

export const MapPage = () => {
  // --- 제공해주신 코드의 State들을 그대로 사용합니다 ---
  const [isChargerMode, setIsChargerMode] = useState(true);
  const [selectedAmenityDetails, setSelectedAmenityDetails] = useState(null);
  const [selectedChargerFilters, setSelectedChargerFilters] = useState([]);
  const [selectedSpeedFilters, setSelectedSpeedFilters] = useState([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedAmenityFilters, setSelectedAmenityFilters] = useState([]);
  const [appliedChargerFilters, setAppliedChargerFilters] = useState([]);
  const [appliedSpeedFilters, setAppliedSpeedFilters] = useState([]);
  const [appliedAmenityFilters, setAppliedAmenityFilters] = useState([]);
  const [appliedShowAvailableOnly, setAppliedShowAvailableOnly] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const searchGroupRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // --- 유틸 함수들을 API 데이터 형식에 맞게 수정 ---
  const getPlaceId = (p) => p?.statId || p?.id;
  const getPlaceName = (p) => p?.statNm || p?.place_name || "이름 정보 없음";
  const getPlaceAddr = (p) =>
    p?.addr || p?.road_address_name || p?.address_name || "주소 정보 없음";

  const savePlaceMeta = (p) => {
    const placeId = getPlaceId(p);
    if (!placeId) return null;
    localStorage.setItem(
      `place:${placeId}`,
      JSON.stringify({ name: getPlaceName(p), addr: getPlaceAddr(p) })
    );
    return placeId;
  };

  // 3. 마커 추가 함수를 API 데이터와 카카오 데이터 모두 처리하도록 수정
  const addMarkers = useCallback((map, places, ctx) => {
    const kakao = window.kakao.maps;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    places.forEach((place) => {
      const lat = Number(ctx === "station" ? place.lat : place.y);
      const lng = Number(ctx === "station" ? place.lng : place.x);

      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      const marker = new kakao.Marker({
        position: new kakao.LatLng(lat, lng),
        map,
      });
      kakao.event.addListener(marker, "click", () =>
        setSelectedAmenityDetails({ ...place, __ctx: ctx })
      );
      markersRef.current.push(marker);
    });
  }, []);

  // 4. ✨ (핵심) 데모용 loadChargers를 실제 API 연동 코드로 교체 ✨
  const loadChargers = useCallback(
    async (map) => {
      try {
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        const chgerTypeParam =
          appliedChargerFilters.length > 0
            ? appliedChargerFilters.map((f) => chargerFilterToCode[f]).join(",")
            : undefined;

        const params = {
          swLat: sw.getLat(),
          swLng: sw.getLng(),
          neLat: ne.getLat(),
          neLng: ne.getLng(),
          chgerType: chgerTypeParam,
          stat: appliedShowAvailableOnly ? "2" : undefined,
        };

        const response = await api.get("/api/map", { params });
        addMarkers(map, response.data, "station");
      } catch (error) {
        console.error("충전소 데이터를 불러오는 데 실패했습니다:", error);
        addMarkers(map, [], "station");
      }
    },
    [addMarkers, appliedChargerFilters, appliedShowAvailableOnly]
  );

  // 주변 상권 로드 (기존 코드와 거의 동일, ctx 전달만 확인)
  const loadAmenities = useCallback(
    (map) => {
      if (!KAKAO_REST_API_KEY) return console.error("카카오 키가 없습니다.");
      const center = map.getCenter();
      const y = center.getLat(),
        x = center.getLng();

      const selected = appliedAmenityFilters[0] || "카페";
      const code = { 식당: "FD6", 카페: "CE7", 공원: "AT4", 쇼핑: "MT1" }[
        selected
      ];

      if (!code) return addMarkers(map, [], "biz");

      fetch(
        `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${code}&x=${x}&y=${y}&radius=1000`,
        {
          headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
        }
      )
        .then((r) => r.json())
        .then((d) => d.documents && addMarkers(map, d.documents, "biz"))
        .catch((e) => console.error(e));
    },
    [appliedAmenityFilters, addMarkers]
  );

  // 주소 검색 (기존 코드 사용)
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

  // 5. ✨ 지도 초기화 및 데이터 로딩 로직을 안정적인 코드로 교체 ✨
  useEffect(() => {
    if (mapContainerRef.current && !mapInstance.current) {
      const kakao = window.kakao.maps;
      const center = new kakao.LatLng(37.5802, 126.923);
      const map = new kakao.Map(mapContainerRef.current, { center, level: 5 });
      mapInstance.current = map;
    }
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const onIdle = () => {
      if (isChargerMode) {
        loadChargers(map);
      } else {
        loadAmenities(map);
      }
    };

    onIdle();

    const kakao = window.kakao.maps;
    const idleListener = kakao.event.addListener(map, "idle", onIdle);

    return () => {
      if (window.kakao && window.kakao.maps && idleListener) {
        kakao.event.removeListener(map, "idle", idleListener);
      }
    };
  }, [
    isChargerMode,
    appliedChargerFilters,
    appliedShowAvailableOnly,
    appliedAmenityFilters,
    loadChargers,
    loadAmenities,
  ]);

  // 필터 팝다운 외부 클릭 감지
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setFilterOpen(false);
    const onClick = (e) => {
      if (!filterOpen) return;
      if (
        searchGroupRef.current &&
        !searchGroupRef.current.contains(e.target)
      ) {
        setFilterOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [filterOpen]);

  const toggleFilter = (filters, setFilters, v) =>
    setFilters((prev) =>
      prev.includes(v) ? prev.filter((item) => item !== v) : [...prev, v]
    );

  const applyFilters = () => {
    if (isChargerMode) {
      setAppliedChargerFilters([...selectedChargerFilters]);
      setAppliedSpeedFilters([...selectedSpeedFilters]);
      setAppliedShowAvailableOnly(!!showAvailableOnly);
    } else {
      setAppliedAmenityFilters([...selectedAmenityFilters]);
    }
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setSelectedChargerFilters([]);
    setSelectedSpeedFilters([]);
    setShowAvailableOnly(false);
    setSelectedAmenityFilters([]);
    setAppliedChargerFilters([]);
    setAppliedSpeedFilters([]);
    setAppliedAmenityFilters([]);
    setAppliedShowAvailableOnly(false);
  };

  const handleClosePopup = () => setSelectedAmenityDetails(null);

  const handleWriteForSelected = () => {
    const pid = savePlaceMeta(selectedAmenityDetails);
    if (pid) navigate(`/review/new/${pid}`);
  };
  const handleListForSelected = () => {
    const pid = savePlaceMeta(selectedAmenityDetails);
    if (pid) navigate(`/reviews/${pid}`);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  // 6. ✨ 좋아요 기능을 API 연동으로 수정 ✨
  const handleLikeClick = () => {
    if (!selectedAmenityDetails || selectedAmenityDetails.__ctx !== "station")
      return;
    const placeId = getPlaceId(selectedAmenityDetails);
    if (!placeId) return;

    api
      .post(`/api/map/${placeId}/like`)
      .then(() => {
        setSelectedAmenityDetails((prev) => ({
          ...prev,
          likes: (prev.likes || 0) + 1,
        }));
        alert("이 충전소를 추천했습니다!");
      })
      .catch((error) => {
        console.error("추천 처리 중 에러 발생:", error);
        alert("오류가 발생했습니다. 다시 시도해주세요.");
      });
  };

  const hasAnyApplied =
    appliedChargerFilters.length > 0 ||
    appliedSpeedFilters.length > 0 ||
    appliedAmenityFilters.length > 0 ||
    appliedShowAvailableOnly;
  const popupCtx =
    selectedAmenityDetails?.__ctx || (isChargerMode ? "station" : "biz");

  return (
    <div className="map-page-container">
      <div
        ref={mapContainerRef}
        id="kakao-map-container"
        className="kakao-map-container"
      />

      <div className="topbar">
        <div className="search-group" ref={searchGroupRef}>
          <div className="search-bar">
            <button
              type="button"
              className="filter-drawer-button"
              aria-label="필터 열기"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((v) => !v)}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
              >
                <path
                  d="M10 6h10v2H10V6zM4 6h2v2H4V6zm6 10h10v2H10v-2zM4 16h6v2H4v-2zm8-5h6v2h-6V11zM4 11h8v2H4v-2z"
                  fill="currentColor"
                />
              </svg>
            </button>
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

          {hasAnyApplied && (
            <div className="applied-chips-overlay">
              <div className="chips" style={{ flexWrap: "wrap", gap: 8 }}>
                {appliedChargerFilters.map((t) => (
                  <span key={`conn-${t}`} className="chip selected">
                    {t}
                  </span>
                ))}
                {appliedSpeedFilters.map((s) => (
                  <span key={`speed-${s}`} className="chip selected">
                    {s}
                  </span>
                ))}
                {appliedShowAvailableOnly && (
                  <span className="chip selected">사용 가능만</span>
                )}
                {appliedAmenityFilters.map((a) => (
                  <span key={`amen-${a}`} className="chip selected">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={`filter-popdown ${filterOpen ? "open" : ""}`}>
            <div className="pop-inner">
              <div className="pop-title">
                {isChargerMode ? "충전소 필터" : "주변 상권 필터"}
              </div>
              {isChargerMode ? (
                <>
                  <div className="pop-section">
                    <div className="pop-label">커넥터</div>
                    <div className="chips">
                      {CHARGER_TYPE_FILTERS.map((t) => (
                        <button
                          key={t}
                          className={`chip ${
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
                  <div className="pop-section">
                    <div className="pop-label">충전 속도</div>
                    <div className="chips">
                      {["급속 (50kW+)", "완속"].map((s) => (
                        <button
                          key={s}
                          className={`chip ${
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
                  <div className="pop-section">
                    <div className="chips">
                      <button
                        className={`chip ${
                          showAvailableOnly ? "selected" : ""
                        }`}
                        onClick={() => setShowAvailableOnly((v) => !v)}
                      >
                        사용 가능만
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="pop-section">
                  <div className="pop-label">카테고리</div>
                  <div className="chips">
                    {["식당", "카페", "공원", "쇼핑"].map((a) => (
                      <button
                        key={a}
                        className={`chip ${
                          selectedAmenityFilters.includes(a) ? "selected" : ""
                        }`}
                        onClick={() =>
                          setSelectedAmenityFilters((prev) =>
                            prev.includes(a) ? [] : [a]
                          )
                        }
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="pop-actions">
                <button className="ghost" onClick={resetFilters}>
                  초기화
                </button>
                <button className="primary" onClick={applyFilters}>
                  적용
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mode-buttons">
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

        <div className="menu-wrap" ref={menuRef}>
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
                className="menu-item-button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/");
                }}
              >
                홈페이지
              </button>
              <button
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

      {selectedAmenityDetails && (
        <div className={`popup-container open`}>
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
                <button
                  className="close-button"
                  onClick={handleClosePopup}
                  aria-label="닫기"
                >
                  X
                </button>
              </div>

              {popupCtx === "station" ? (
                <>
                  <div className="amenity-info-grid">
                    <div className="amenity-info-item">
                      <p className="info-label">운영 기관</p>
                      <p className="info-value">
                        {selectedAmenityDetails.bnm || "-"}
                      </p>
                    </div>
                    <div className="amenity-info-item">
                      <p className="info-label">이용 가능 시간</p>
                      <p className="info-value">
                        {selectedAmenityDetails.useTime || "-"}
                      </p>
                    </div>
                    <div className="amenity-info-item">
                      <p className="info-label">이용 제한</p>
                      <p className="info-value">
                        {selectedAmenityDetails.limitYn === "Y"
                          ? selectedAmenityDetails.limitDetail
                          : "제한 없음"}
                      </p>
                    </div>
                    <div className="amenity-info-item">
                      <p className="info-label">주차비</p>
                      <p className="info-value">
                        {selectedAmenityDetails.parkingFree === "Y"
                          ? "무료"
                          : "유료"}
                      </p>
                    </div>
                  </div>
                  <button
                    className="recommend-button"
                    onClick={handleLikeClick}
                  >
                    <span className="heart-ic">❤️</span> 좋아요{" "}
                    <span className="like-num">
                      {selectedAmenityDetails.likes || 0}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <img
                    src={`https://placehold.co/600x400?text=${getPlaceName(
                      selectedAmenityDetails
                    )}`}
                    alt={`${getPlaceName(selectedAmenityDetails)} 사진`}
                    className="amenity-image"
                  />
                  <div className="amenity-info-grid">
                    <div className="amenity-info-item">
                      <p className="info-label">카테고리</p>
                      <p className="info-value">
                        {selectedAmenityDetails?.category_name
                          ? selectedAmenityDetails.category_name
                              .split(" > ")
                              .pop()
                          : "정보 없음"}
                      </p>
                    </div>
                    <div className="amenity-info-item">
                      <p className="info-label">전화번호</p>
                      <p className="info-value">
                        {selectedAmenityDetails?.phone || "정보 없음"}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {popupCtx === "station" && (
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
                      fontWeight: "bold",
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
                      fontWeight: "bold",
                    }}
                  >
                    리뷰 보기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
