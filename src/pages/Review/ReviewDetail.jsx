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

              {/* 별점/추천 */}
              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>별점 / 추천</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div
                  className={styles.starRatingButton}
                  style={{
                    backgroundColor: "#00C2AD",
                    color: "#fff",
                    borderColor: "#00C2AD",
                  }}
                >
                  <div className={styles.starRatingValue}>⭐ {r.rating}</div>
                </div>
                <div className={styles.starRatingButton}>
                  <div className={styles.starRatingValue}>
                    {r.recommend ? "추천" : "비추천"}
                  </div>
                </div>
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

              <p className={styles.stationAddress} style={{ marginTop: 8 }}>
                사진: {r.photosCount ? `${r.photosCount}장` : "없음"} · 작성일:{" "}
                {fmt(r.createdAt)}
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
