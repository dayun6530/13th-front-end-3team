// src/pages/Review/ReviewList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import styles from "./Review.module.css";

const getMeta = (placeId) =>
  JSON.parse(localStorage.getItem(`place:${placeId}`) || "null");

const readList = (placeId) =>
  JSON.parse(localStorage.getItem(`reviews:${placeId}`) || "[]");

const writeList = (placeId, list) =>
  localStorage.setItem(`reviews:${placeId}`, JSON.stringify(list));

export const ReviewListPage = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();

  const meta = getMeta(placeId) || {
    name: "이름 정보 없음",
    addr: "주소 정보 없음",
  };

  const [list, setList] = useState([]);

  // 최초 로드 + 정렬(좋아요 내림차순), 기존 데이터에 likes가 없다면 0으로 채움
  useEffect(() => {
    const raw = readList(placeId).map((r) => ({
      likes: 0,
      ...r, // 기존 rating/recommend가 남아있어도 무시(표시 안 함)
    }));
    raw.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    setList(raw);
  }, [placeId]);

  const snippet = (t = "") => (t.length > 40 ? t.slice(0, 40) + "…" : t);
  const fmt = (ts) =>
    ts ? new Date(ts).toLocaleString() : new Date().toLocaleString();

  // ✅ 좋아요 기능: 목록에서 바로 +1
  const likeReview = (id, e) => {
    e.preventDefault(); // Link 클릭 전파 방지
    e.stopPropagation();

    const fresh = readList(placeId).map((r) => ({ likes: 0, ...r }));
    const idx = fresh.findIndex((r) => r.id === id);
    if (idx < 0) return;

    fresh[idx].likes = (fresh[idx].likes || 0) + 1;

    // 저장 후 "좋아요 많은 순"으로 재정렬
    fresh.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    writeList(placeId, fresh);
    setList(fresh);
  };

  // 리뷰가 없을 때
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
                <div className={styles.sectionTitle}>
                  리뷰 목록{" "}
                  <span style={{ color: "#637787" }}>(좋아요 많은 순)</span>
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {list.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "12px 14px",
                      border: "1px solid #e5e8ea",
                      borderRadius: 12,
                      background: "#fff",
                    }}
                  >
                    {/* 왼쪽: 텍스트 → 상세로 이동 */}
                    <Link
                      to={`/reviews/${placeId}/${r.id}`}
                      style={{
                        flex: 1,
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div style={{ color: "#444" }}>{snippet(r.text)}</div>
                      <div style={{ whiteSpace: "nowrap", color: "#637787" }}>
                        {fmt(r.createdAt)}
                      </div>
                    </Link>

                    {/* 오른쪽: 좋아요 버튼 */}
                    <button
                      onClick={(e) => likeReview(r.id, e)}
                      title="좋아요"
                      style={{
                        alignSelf: "flex-start",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid #e5e8ea",
                        background: "#fff",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span role="img" aria-label="heart">
                        ❤️
                      </span>
                      <span style={{ fontWeight: 700 }}>{r.likes || 0}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* 리뷰 추가 작성 */}
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

              {/* 지도로 가기 */}
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
