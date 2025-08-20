// src/pages/Review/ReviewDetail.jsx
import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import styles from "./Review.module.css";

export const ReviewDetailPage = () => {
  const { placeId, reviewId } = useParams();
  const navigate = useNavigate();

  const meta = JSON.parse(
    localStorage.getItem(`place:${placeId}`) || "null"
  ) || {
    name: "이름 정보 없음",
    addr: "주소 정보 없음",
  };

  const list = JSON.parse(localStorage.getItem(`reviews:${placeId}`) || "[]");
  const r = list.find((x) => String(x.id) === String(reviewId));

  const fmt = (ts) => new Date(ts).toLocaleString();
  const photoList = Array.isArray(r?.photos) ? r.photos : [];

  if (!r) {
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
                <div className={styles.sectionTitleWrapper}>
                  <div className={styles.sectionTitle}>
                    리뷰를 찾을 수 없습니다
                  </div>
                </div>

                <div
                  className={styles.submitButtonSection}
                  style={{ display: "flex", gap: 12 }}
                >
                  <button
                    className={styles.submitReviewButton}
                    onClick={() => navigate(-1)}
                  >
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>뒤로</div>
                    </div>
                  </button>
                  <Link
                    to={`/reviews/${placeId}`}
                    className={styles.submitReviewButton}
                  >
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>목록으로</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            {/* end not-found */}
          </div>
        </div>
      </div>
    );
  }

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
              {/* 장소 정보 */}
              <div className={styles.stationNameSection}>
                <div className={styles.stationName}>{meta.name}</div>
              </div>
              <div className={styles.stationAddressSection}>
                <div className={styles.stationAddress}>{meta.addr}</div>
              </div>

              {/* 추천 여부만 표시 */}
              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>추천 여부</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
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
              </div>

              {/* 리뷰 내용 */}
              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>리뷰 내용</div>
              </div>
              <div className={styles.reviewInputArea}>
                <div className={styles.reviewInputContainer}>
                  <div
                    className={styles.reviewInputField}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {r.text}
                  </div>
                </div>
              </div>

              {/* 사진 그리드 */}
              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>사진</div>
              </div>
              {photoList.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 10,
                  }}
                >
                  {photoList.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`review-photo-${idx}`}
                      style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #e5e8ea",
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className={styles.stationAddress}>사진 없음</p>
              )}

              <p className={styles.stationAddress} style={{ marginTop: 8 }}>
                작성일: {fmt(r.createdAt)}
              </p>

              {/* 액션 */}
              <div
                className={styles.submitButtonSection}
                style={{ display: "flex", gap: 12 }}
              >
                <Link
                  to={`/reviews/${placeId}`}
                  className={styles.submitReviewButton}
                >
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>목록으로</div>
                  </div>
                </Link>
                <Link
                  to={`/review/new/${placeId}`}
                  className={styles.submitReviewButton}
                >
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>새 리뷰 작성</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          {/* end detail */}
        </div>
      </div>
    </div>
  );
};
