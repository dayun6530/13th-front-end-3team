// src/pages/Map/MapPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./MapPage.css";
import { useNavigate } from "react-router-dom";

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;

export const MapPage = () => {
  // 모드: 충전소 / 주변상권
  const [isChargerMode, setIsChargerMode] = useState(true);

  // 팝업 상세
  const [selectedAmenityDetails, setSelectedAmenityDetails] = useState(null);

  // (팝다운 내부) 선택 중 필터
  const [selectedChargerFilters, setSelectedChargerFilters] = useState([]);
  const [selectedSpeedFilters, setSelectedSpeedFilters] = useState([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedAmenityFilters, setSelectedAmenityFilters] = useState([]);
  const [radiusKm, setRadiusKm] = useState(3); // UI 전용

  // (검색창 아래 칩으로 표시할) 적용된 필터
  const [appliedChargerFilters, setAppliedChargerFilters] = useState([]);
  const [appliedSpeedFilters, setAppliedSpeedFilters] = useState([]);
  const [appliedAmenityFilters, setAppliedAmenityFilters] = useState([]);
  const [appliedShowAvailableOnly, setAppliedShowAvailableOnly] =
    useState(false);

  // 검색어
  const [searchQuery, setSearchQuery] = useState("");

  // 지도 refs
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // 라우팅
  const navigate = useNavigate();

  const AMENITY_RADIUS_M = 500;

  // 유틸
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

  // 마커 추가
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

  // (데모) 충전소 로드
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
      const selected =
        appliedAmenityFilters[0] || selectedAmenityFilters[0] || "카페";
      const code = { 식당: "FD6", 카페: "CE7", 공원: "AT4", 쇼핑: "MT1" }[
        selected
      ];
      if (!code) return addMarkers(map, []);
      fetch(
        `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${code}&x=${x}&y=${y}&radius=${AMENITY_RADIUS_M}&size=15`,
        { headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } }
      )
        .then((r) => r.json())
        .then((d) => d.documents && addMarkers(map, d.documents))
        .catch((e) => console.error(e));
    },
    [
      KAKAO_REST_API_KEY,
      appliedAmenityFilters,
      selectedAmenityFilters,
      addMarkers,
    ]
  );

  // 주소 검색
  const handleSearch = () => {
    if (!searchQuery) return;
    fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
        searchQuery
      )}`,
      { headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } }
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
  }, [isChargerMode, loadChargers, loadAmenities]);

  // 팝다운
  const [filterOpen, setFilterOpen] = useState(false);
  const searchGroupRef = useRef(null);
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

  // 유틸
  const toggleFilter = (filters, setFilters, v) =>
    filters.includes(v) ? setFilters([]) : setFilters([v]);

  // 적용: 선택 상태 → 적용 상태 복사 (검색창 아래 칩 표시)
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

  // 초기화: 선택/적용 모두 비우기 (칩도 숨김)
  const resetFilters = () => {
    setSelectedChargerFilters([]);
    setSelectedSpeedFilters([]);
    setShowAvailableOnly(false);
    setSelectedAmenityFilters([]);
    setRadiusKm(3);

    setAppliedChargerFilters([]);
    setAppliedSpeedFilters([]);
    setAppliedAmenityFilters([]);
    setAppliedShowAvailableOnly(false);
  };

  const handleClosePopup = () => setSelectedAmenityDetails(null);

  // 리뷰 작성/목록 이동
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

  // 상단 메뉴
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

  // 좋아요
  const [likeCount, setLikeCount] = useState(0);
  useEffect(() => {
    if (!selectedAmenityDetails) return;
    const pid = getPlaceId(selectedAmenityDetails);
    const stored = parseInt(localStorage.getItem(`likes:${pid}`) || "0", 10);
    setLikeCount(Number.isNaN(stored) ? 0 : stored);
  }, [selectedAmenityDetails]);
  const handleLikeClick = () => {
    if (!selectedAmenityDetails) return;
    const pid = getPlaceId(selectedAmenityDetails);
    const next = likeCount + 1;
    localStorage.setItem(`likes:${pid}`, String(next));
    setLikeCount(next);
  };

  // 적용된 칩 존재 여부
  const hasAnyApplied =
    appliedChargerFilters.length > 0 ||
    appliedSpeedFilters.length > 0 ||
    appliedAmenityFilters.length > 0 ||
    appliedShowAvailableOnly;

  return (
    <div className="map-page-container">
      {/* 지도 */}
      <div
        ref={mapContainerRef}
        id="kakao-map-container"
        className="kakao-map-container"
      />

      {/* ===== 상단 Topbar (검색 + 모드 + 메뉴) ===== */}
      <div className="topbar">
        {/* 검색 그룹(필터 버튼 포함) */}
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

          {/* ▼ 오버레이 칩: 검색창을 밀지 않음 (absolute) */}
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

          {/* ▼ 필터 팝다운 */}
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
                      {["DC콤보", "차데모", "AC3상"].map((t) => (
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

                  <div className="pop-section">
                    <div className="pop-label">범위</div>
                    <div className="radius-fixed">
                      <span className="chip selected">반경 500m</span>
                      <span className="radius-note">현재 위치 기준</span>
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

        {/* 모드 토글 */}
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

        {/* 메뉴 */}
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

      {/* 팝업(바텀시트) */}
      {selectedAmenityDetails && (
        <div
          className={`popup-container ${selectedAmenityDetails ? "open" : ""}`}
        >
          <div className="popup-handle" onClick={handleClosePopup} />
          <div className="popup-content">
            <div className="amenity-details">
              <div className="popup-header">
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <h2 className="popup-title" style={{ margin: 0 }}>
                      {getPlaceName(selectedAmenityDetails)}
                    </h2>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        color: "#e53935",
                        fontWeight: 700,
                      }}
                    >
                      <span className="heart-ic">❤️</span>
                      <span className="like-num">{likeCount}</span>
                    </span>
                  </div>
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

              <button className="recommend-button" onClick={handleLikeClick}>
                <span className="heart-ic" style={{ marginRight: 6 }}>
                  ❤️
                </span>
                좋아요
              </button>

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
    </div>
  );
};
