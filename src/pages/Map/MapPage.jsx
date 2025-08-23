// src/pages/Map/MapPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./MapPage.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios"; // 서버가 없어도 try/catch로 안전 처리됨

// ------- 상수/매핑 -------
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
const amenityFilterToCode = {
  카페: "CE7",
  음식점: "FD6",
  편의점: "CS2",
  공원: "PK6",
};

// ------- 유틸 -------
const slugify = (s) =>
  String(s || "unknown")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");

const getPlaceId = (p) =>
  p?.id
    ? String(p.id)
    : p?.statId
    ? String(p.statId)
    : "poi-" + slugify(p?.place_name || p?.statNm);

const getPlaceName = (p) => p?.place_name || p?.statNm || "이름 정보 없음";
const getPlaceAddr = (p) =>
  p?.road_address_name || p?.address_name || p?.addr || "주소 정보 없음";

const savePlaceMeta = (p) => {
  const placeId = getPlaceId(p);
  localStorage.setItem(
    `place:${placeId}`,
    JSON.stringify({ name: getPlaceName(p), addr: getPlaceAddr(p) })
  );
  return placeId;
};

export const MapPage = () => {
  // ------- 상태 -------
  const [isChargerMode, setIsChargerMode] = useState(true);
  const [selectedAmenityDetails, setSelectedAmenityDetails] = useState(null); // { ...place, __ctx: 'station' | 'biz' }

  // ✅ 필터 패널이 열릴 때의 모드 스냅샷(패널이 열려있는 동안 고정)
  const [filterCtx, setFilterCtx] = useState("charger"); // 'charger' | 'amenity'

  // 필터(선택 중)
  const [selectedChargerFilters, setSelectedChargerFilters] = useState([]);
  const [selectedAmenityFilters, setSelectedAmenityFilters] = useState([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  // 필터(적용된)
  const [appliedChargerFilters, setAppliedChargerFilters] = useState([]);
  const [appliedAmenityFilters, setAppliedAmenityFilters] = useState([]);
  const [appliedShowAvailableOnly, setAppliedShowAvailableOnly] =
    useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  // refs
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // UI 토글
  const [filterOpen, setFilterOpen] = useState(false);
  const searchGroupRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navigate = useNavigate();

  // ------- 마커 공통 함수 -------
  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  };

  // map shape: 'charger' | 'amenity'
  const addMarkers = useCallback((map, places, ctx, shape) => {
    if (!window.kakao) return;
    const kakao = window.kakao.maps;
    clearMarkers();

    places.forEach((place) => {
      const lat = Number(shape === "charger" ? place.lat : place.y);
      const lng = Number(shape === "charger" ? place.lng : place.x);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      const marker = new kakao.Marker({
        position: new kakao.LatLng(lat, lng),
        map,
      });

      kakao.event.addListener(marker, "click", () => {
        setSelectedAmenityDetails({ ...place, __ctx: ctx });
      });

      markersRef.current.push(marker);
    });
  }, []);

  // ------- 데이터 로드 -------
  const loadChargers = useCallback(
    async (map) => {
      if (!window.kakao?.maps) return;
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
          stat: appliedShowAvailableOnly ? "2" : undefined, // 2: 사용가능
        };

        const res = await api.get("/api/map", { params });
        addMarkers(map, res.data || [], "station", "charger");
      } catch (e) {
        console.error("충전소 불러오기 실패:", e);
        addMarkers(map, [], "station", "charger");
      }
    },
    [appliedChargerFilters, appliedShowAvailableOnly, addMarkers]
  );

  const loadAmenities = useCallback(
    (map) => {
      if (!window.kakao?.maps || appliedAmenityFilters.length === 0) {
        addMarkers(map, [], "biz", "amenity");
        return;
      }
      const kakao = window.kakao.maps;
      const ps = new kakao.services.Places();
      const center = map.getCenter();
      const code = amenityFilterToCode[appliedAmenityFilters[0]];
      if (!code) {
        addMarkers(map, [], "biz", "amenity");
        return;
      }
      ps.categorySearch(
        code,
        (data, status) => {
          if (status === kakao.services.Status.OK) {
            addMarkers(map, data, "biz", "amenity");
          } else {
            addMarkers(map, [], "biz", "amenity");
          }
        },
        { location: center, radius: 3000 }
      );
    },
    [appliedAmenityFilters, addMarkers]
  );

  // ------- 지도 초기화 -------
  useEffect(() => {
    if (!window.kakao?.maps || mapInstance.current) return;
    const kakao = window.kakao.maps;
    const center = new kakao.LatLng(37.566826, 126.9786567);
    const map = new kakao.Map(mapContainerRef.current, { center, level: 5 });
    mapInstance.current = map;
  }, []);

  // ------- 데이터 로딩 트리거(모드/필터/이동 시) -------
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
    kakao.event.addListener(map, "idle", onIdle);
    return () => kakao.event.removeListener(map, "idle", onIdle);
  }, [isChargerMode, loadChargers, loadAmenities]);

  // ------- 검색 -------
  const handleSearch = () => {
    if (!searchQuery.trim() || !window.kakao?.maps) return;
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchQuery, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const { y, x } = data[0];
        const moveLatLng = new window.kakao.maps.LatLng(y, x);
        mapInstance.current.setCenter(moveLatLng);
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  // ------- 필터 -------
  // ✅ 하나만 선택: 주변 상권(type === 'amenity')은 단일 선택, 충전소는 다중 선택 유지
  const handleFilterToggle = (type, value) => {
    if (type === "amenity") {
      setSelectedAmenityFilters((prev) => (prev[0] === value ? [] : [value]));
    } else {
      setSelectedChargerFilters((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
      );
    }
  };

  // ✅ 적용은 filterCtx 기준으로(패널을 열었을 때의 모드)
  // ✅ applyFilters 교체
  const applyFilters = () => {
    if (filterCtx === "charger") {
      // 충전소 필터 적용
      setAppliedChargerFilters([...selectedChargerFilters]);
      setAppliedShowAvailableOnly(!!showAvailableOnly);
      // 반대 모드 칩 비우기
      setAppliedAmenityFilters([]);
    } else {
      // 상권 필터 적용
      setAppliedAmenityFilters([...selectedAmenityFilters]);
      // 반대 모드 칩 비우기
      setAppliedChargerFilters([]);
      setAppliedShowAvailableOnly(false);
    }
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setSelectedChargerFilters([]);
    setSelectedAmenityFilters([]);
    setShowAvailableOnly(false);
  };

  // ------- 팝업 & 메뉴 -------
  const handleClosePopup = () => setSelectedAmenityDetails(null);

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

  // 좋아요(로컬) + 서버가 있으면 함께 시도
  const [likeCount, setLikeCount] = useState(0);
  useEffect(() => {
    if (!selectedAmenityDetails) return;
    const pid = getPlaceId(selectedAmenityDetails);
    const stored = parseInt(localStorage.getItem(`likes:${pid}`) || "0", 10);
    setLikeCount(Number.isNaN(stored) ? 0 : stored);
  }, [selectedAmenityDetails]);

  const incLocalLike = (pid) => {
    const next = likeCount + 1;
    localStorage.setItem(`likes:${pid}`, String(next));
    setLikeCount(next);
  };

  const handleLikeClick = async () => {
    if (!selectedAmenityDetails) return;
    const pid = getPlaceId(selectedAmenityDetails);

    if (selectedAmenityDetails.__ctx === "station" && api) {
      try {
        await api.post(`/api/map/${pid}/like`);
        incLocalLike(pid);
        return;
      } catch (e) {
        console.warn("서버 좋아요 실패, 로컬 반영:", e);
      }
    }
    incLocalLike(pid);
  };

  // 외부 클릭으로 필터 닫기
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

  // 메뉴 외부 클릭
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  // 적용된 칩 존재 여부
  // ✅ hasAnyApplied 교체
  const hasAnyApplied = isChargerMode
    ? appliedChargerFilters.length > 0 || appliedShowAvailableOnly
    : appliedAmenityFilters.length > 0;

  // 팝업 컨텍스트
  const popupCtx =
    selectedAmenityDetails?.__ctx || (isChargerMode ? "station" : "biz");

  // ------- 렌더 -------
  return (
    <div className="map-page-container">
      {/* 지도 */}
      <div
        ref={mapContainerRef}
        id="kakao-map-container"
        className="kakao-map-container"
      />

      {/* Topbar */}
      <div className="topbar">
        {/* 검색 + 필터 */}
        <div className="search-group" ref={searchGroupRef}>
          <div className="search-bar">
            <button
              type="button"
              className="filter-drawer-button"
              aria-label="필터 열기"
              aria-expanded={filterOpen}
              onClick={() => {
                // ✅ 패널을 여는 순간의 모드를 스냅샷해 유지
                setFilterCtx(isChargerMode ? "charger" : "amenity");
                setFilterOpen((v) => !v);
              }}
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
              placeholder="장소/주소 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search-button" onClick={handleSearch}>
              검색
            </button>
          </div>

          {/* ✅ 칩 오버레이 교체 */}
          {hasAnyApplied && (
            <div className="applied-chips-overlay">
              <div className="chips" style={{ flexWrap: "wrap", gap: 8 }}>
                {isChargerMode ? (
                  <>
                    {appliedChargerFilters.map((t) => (
                      <span key={`conn-${t}`} className="chip selected">
                        {t}
                      </span>
                    ))}
                    {appliedShowAvailableOnly && (
                      <span className="chip selected">사용 가능만</span>
                    )}
                  </>
                ) : (
                  <>
                    {appliedAmenityFilters.map((a) => (
                      <span key={`amen-${a}`} className="chip selected">
                        {a}
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* 필터 팝다운 — ✅ filterCtx 기준으로 고정 렌더 */}
          <div className={`filter-popdown ${filterOpen ? "open" : ""}`}>
            <div className="pop-inner">
              <div className="pop-title">
                {filterCtx === "charger" ? "충전소 필터" : "주변 상권 필터"}
              </div>

              {filterCtx === "charger" ? (
                <>
                  <div className="pop-section">
                    <div className="pop-label">충전기 타입</div>
                    <div className="chips">
                      {CHARGER_TYPE_FILTERS.map((f) => (
                        <button
                          key={f}
                          className={`chip ${
                            selectedChargerFilters.includes(f) ? "selected" : ""
                          }`}
                          onClick={() => handleFilterToggle("charger", f)}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pop-section">
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={showAvailableOnly}
                        onChange={(e) => setShowAvailableOnly(e.target.checked)}
                      />
                      사용 가능한 충전소만 보기
                    </label>
                  </div>
                </>
              ) : (
                <div className="pop-section">
                  <div className="pop-label">카테고리</div>
                  <div className="chips">
                    {Object.keys(amenityFilterToCode).map((a) => (
                      <button
                        key={a}
                        className={`chip ${
                          selectedAmenityFilters.includes(a) ? "selected" : ""
                        }`}
                        onClick={() => handleFilterToggle("amenity", a)}
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
            onClick={() => {
              setIsChargerMode(true);
              setSelectedAmenityDetails(null);
              clearMarkers();
            }}
          >
            충전소
          </button>
          <button
            className={`filter-button ${!isChargerMode ? "active" : ""}`}
            onClick={() => {
              setIsChargerMode(false);
              setSelectedAmenityDetails(null);
              clearMarkers();
            }}
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
        <div className="popup-container open">
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

              {/* 충전소일 때만 추가 정보 표시 */}
              {popupCtx === "station" && (
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
              )}

              {/* 좋아요 버튼(항상 노출) */}
              <button className="recommend-button" onClick={handleLikeClick}>
                <span className="heart-ic" style={{ marginRight: 6 }}>
                  ❤️
                </span>
                좋아요
              </button>

              {/* 리뷰 버튼: 충전소일 때만 노출 */}
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
