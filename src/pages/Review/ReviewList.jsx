// src/pages/Review/ReviewList.jsx
import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import styles from "./Review.module.css";

const getMeta = (placeId) =>
  JSON.parse(localStorage.getItem(`place:${placeId}`) || "null");

const getList = (placeId) =>
  JSON.parse(localStorage.getItem(`reviews:${placeId}`) || "[]");

// [수정] 사진이 없는 리뷰를 위해 임시 썸네일 소스(원하면 삭제/교체 가능)
const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1502877338535-766e1452684a",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1520975916090-3105956dac38",
  "https://images.unsplash.com/photo-1520975693416-35a2b48510d3",
];

export const ReviewListPage = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();

  const meta = getMeta(placeId) || {
    name: "이름 정보 없음",
    addr: "주소 정보 없음",
  };
  const list = getList(placeId);

  const snippet = (t) => (t?.length > 90 ? t.slice(0, 90) + "…" : t || "");
  const fmt = (ts) => new Date(ts).toLocaleString();

  // ✅ 추천 먼저, 같은 추천 그룹 내에서는 최신순(작성일 내림차순)
  const sorted = [...list].sort((a, b) => {
    if (a.recommend === b.recommend) {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
    // true 먼저
    return a.recommend ? -1 : 1;
  });

  // 리뷰가 없을 때
  if (!sorted.length) {
    return (
      <div className={styles.reviewPageContainer}>
        <div className={styles.headerWrapper}>
          <div className={styles.mainContent}>
            <div className={styles.header}>
              <div className={styles.logoArea}>
                <div className={styles.logoTextWrapper}>
                  <div className={styles.logoText}>Charge Buddy</div>
                </div>
              </div>
            </div>

            <div className={styles.reviewFormContainer}>
              <div className={styles.reviewCard}>
                <div className={styles.stationNameSection}>
                  <div className={styles.stationName}>{meta.name}</div>
                </div>
                <div className={styles.stationAddressSection}>
                  <div className={styles.stationAddress}>{meta.addr}</div>
                </div>

                <div className={styles.sectionTitleWrapper}>
                  <div className={styles.sectionTitle}>리뷰가 없습니다</div>
                </div>

                <div className={styles.submitButtonSection}>
                  <Link
                    to={`/review/new/${placeId}`}
                    className={styles.submitReviewButton}
                  >
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>리뷰 작성</div>
                    </div>
                  </Link>
                </div>

                <div className={styles.submitButtonSection}>
                  <button
                    className={styles.submitReviewButton}
                    onClick={() => navigate(-1)}
                  >
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>뒤로</div>
                    </div>
                  </button>
                </div>

                <div className={styles.submitButtonSection}>
                  <Link to="/map" className={styles.submitReviewButton}>
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>지도로 가기</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            {/* end empty */}
          </div>
        </div>
      </div>
    );
  }

  // 리뷰가 있을 때(목록)
  return (
    <div className={styles.reviewPageContainer}>
      <div className={styles.headerWrapper}>
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <div className={styles.logoArea}>
              <div className={styles.logoTextWrapper}>
                <div className={styles.logoText}>Charge Buddy</div>
              </div>
            </div>
          </div>

          <div className={styles.reviewFormContainer}>
            <div className={styles.reviewCard}>
              <div className={styles.stationNameSection}>
                <div className={styles.stationName}>{meta.name}</div>
              </div>
              <div className={styles.stationAddressSection}>
                <div className={styles.stationAddress}>{meta.addr}</div>
              </div>

              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>리뷰 목록</div>
              </div>

              {/* ✅ 카드형 목록 */}
              <div style={{ display: "grid", gap: 12 }}>
                {sorted.map((r) => {
                  // [수정] 안전한 사진 배열 준비: r.photos(배열) 우선, 없으면 photosCount로 FALLBACK_PHOTOS에서 채움
                  const photos = Array.isArray(r.photos)
                    ? r.photos
                    : r.photosCount && r.photosCount > 0
                    ? FALLBACK_PHOTOS.slice(0, r.photosCount)
                    : [];

                  return (
                    <Link
                      key={r.id}
                      to={`/reviews/${placeId}/${r.id}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 12,
                        padding: "14px 16px",
                        border: "1px solid #e5e8ea",
                        borderRadius: 12,
                        textDecoration: "none",
                        color: "inherit",
                        background: "#fff",
                      }}
                    >
                      <div style={{ display: "grid", gap: 8 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          {/* 추천/비추천 배지 */}
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 10px",
                              borderRadius: 999,
                              border: "1px solid #e5e8ea",
                              background: r.recommend ? "#e8fff7" : "#fff1f1",
                              color: r.recommend ? "#117e62" : "#9a1e1e",
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {r.recommend ? "추천" : "비추천"}
                          </span>

                          {/* 사진 수 표시 */}
                          <span
                            style={{
                              marginLeft: 4,
                              fontSize: 12,
                              color: "#637787",
                            }}
                          >
                            {photos.length > 0
                              ? `사진 ${photos.length}장`
                              : "사진 없음"}
                          </span>
                        </div>

                        {/* 내용 스니펫 */}
                        <div style={{ color: "#333", lineHeight: 1.5 }}>
                          {snippet(r.text)}
                        </div>

                        {/* [수정] 썸네일 프리뷰(최대 3장) — 기존 thumbs 참조를 photos로 교체 */}
                        {photos.length > 0 && (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fill, minmax(72px, 1fr))",
                              gap: 8,
                            }}
                          >
                            {photos.slice(0, 3).map((src, idx) => (
                              <img
                                key={idx}
                                src={src}
                                alt={`thumb-${idx}`}
                                style={{
                                  width: "100%",
                                  height: 72,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  border: "1px solid #e5e8ea",
                                }}
                              />
                            ))}
                          </div>
                        )}

                        {/* 작성일 */}
                        <div style={{ color: "#637787", fontSize: 12 }}>
                          {fmt(r.createdAt)}
                        </div>
                      </div>

                      {/* 자세히 보기 텍스트(오른쪽 정렬) */}
                      {/*<div
                        style={{
                          whiteSpace: "nowrap",
                          alignSelf: "center",
                          color: "#00C2AD",
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        자세히 보기 →
                      </div>
                      */}
                    </Link>
                  );
                })}
              </div>

              {/* 리뷰 추가 작성 & 지도로 가기 */}
              <div
                className={styles.submitButtonSection}
                style={{ marginTop: 12 }}
              >
                <Link
                  to={`/review/new/${placeId}`}
                  className={styles.submitReviewButton}
                >
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>리뷰 추가 작성</div>
                  </div>
                </Link>
              </div>

              <div className={styles.submitButtonSection}>
                <Link to="/map" className={styles.submitReviewButton}>
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>지도로 가기</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          {/* end list */}
        </div>
      </div>
    </div>
  );
};
