// src/pages/Review/ReviewList.jsx
import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import styles from "./Review.module.css";

const getMeta = (placeId) =>
  JSON.parse(localStorage.getItem(`place:${placeId}`) || "null");

const getList = (placeId) =>
  JSON.parse(localStorage.getItem(`reviews:${placeId}`) || "[]");

export const ReviewListPage = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();

  const meta = getMeta(placeId) || {
    name: "이름 정보 없음",
    addr: "주소 정보 없음",
  };
  const list = getList(placeId);

  const snippet = (t) => (t.length > 40 ? t.slice(0, 40) + "…" : t);
  const fmt = (ts) => new Date(ts).toLocaleString();

  if (!list.length) {
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
              </div>
            </div>
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
              <div className={styles.stationNameSection}>
                <div className={styles.stationName}>{meta.name}</div>
              </div>
              <div className={styles.stationAddressSection}>
                <div className={styles.stationAddress}>{meta.addr}</div>
              </div>

              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>리뷰 목록</div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {list
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((r) => (
                    <Link
                      key={r.id}
                      to={`/reviews/${placeId}/${r.id}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "12px 14px",
                        border: "1px solid #e5e8ea",
                        borderRadius: 12,
                        textDecoration: "none",
                        color: "inherit",
                        background: "#fff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>
                          ⭐ {r.rating}점 · {r.recommend ? "추천" : "비추천"}
                        </div>
                        <div style={{ color: "#444" }}>{snippet(r.text)}</div>
                      </div>
                      <div style={{ whiteSpace: "nowrap", color: "#637787" }}>
                        {fmt(r.createdAt)}
                      </div>
                    </Link>
                  ))}
              </div>

              <div className={styles.submitButtonSection}>
                <Link
                  to={`/review/new/${placeId}`}
                  className={styles.submitReviewButton}
                >
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>리뷰 추가 작성</div>
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
