// src/pages/Review/ReviewView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import styles from "./Review.module.css";

// 로컬스토리지 유틸
const readList = (placeId) =>
  JSON.parse(localStorage.getItem(`reviews:${placeId}`) || "[]");
const writeList = (placeId, list) =>
  localStorage.setItem(`reviews:${placeId}`, JSON.stringify(list));

export const ReviewViewPage = () => {
  const navigate = useNavigate();
  // 라우트: /reviews/:placeId/:reviewId  (스크린샷 경로)
  const { placeId, reviewId } = useParams();

  // 장소 메타
  const meta = useMemo(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(`place:${placeId}`) || "null") || {
          name: "이름 정보 없음",
          addr: "주소 정보 없음",
        }
      );
    } catch {
      return { name: "이름 정보 없음", addr: "주소 정보 없음" };
    }
  }, [placeId]);

  const [review, setReview] = useState(null);

  // 리뷰 로드 (likes 없으면 0으로 기본값)
  useEffect(() => {
    const list = readList(placeId).map((r) => ({ likes: 0, ...r }));
    const found = list.find((r) => String(r.id) === String(reviewId)) || null;
    setReview(found);
  }, [placeId, reviewId]);

  const fmt = (ts) =>
    ts ? new Date(ts).toLocaleString() : "작성 시간 정보 없음";

  // 좋아요: 같은 리스트 갱신 → 목록/상세 합산
  const likeThis = () => {
    const list = readList(placeId).map((r) => ({ likes: 0, ...r }));
    const idx = list.findIndex((r) => String(r.id) === String(reviewId));
    if (idx < 0) return;
    list[idx].likes = (list[idx].likes || 0) + 1;
    writeList(placeId, list);
    setReview({ ...list[idx] });
  };

  // 없는 경우
  if (!review) {
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
                    리뷰를 찾을 수 없습니다.
                  </div>
                </div>

                <div className={styles.submitButtonSection}>
                  <Link
                    to={`/reviews/${placeId}`}
                    className={styles.submitReviewButton}
                  >
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>목록으로</div>
                    </div>
                  </Link>
                </div>

                <div className={styles.submitButtonSection}>
                  <button
                    className={styles.submitReviewButton}
                    onClick={() => navigate("/map")}
                  >
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>지도로 가기</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            {/* end empty */}
          </div>
        </div>
      </div>
    );
  }

  // ===== 렌더(별점/추천/사진 전부 제거, 좋아요만 표시) =====
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

              {/* 본문 */}
              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>리뷰 내용</div>
              </div>
              <div className={styles.reviewInputArea}>
                <div className={styles.reviewInputContainer}>
                  <div
                    className={styles.reviewInputField}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {review.text}
                  </div>
                </div>
              </div>

              {/* 사진/별점/추천 문구 제거, 작성일만 남김 */}
              <p className={styles.stationAddress}>
                작성일: {fmt(review.createdAt)}
              </p>

              {/* ✅ 좋아요 버튼 (목록/상세 합산) */}
              <div className={styles.submitButtonSection}>
                <button
                  type="button"
                  className={styles.submitReviewButton}
                  onClick={likeThis}
                  title="좋아요"
                >
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>
                      ❤️ 좋아요 {review.likes || 0}
                    </div>
                  </div>
                </button>
              </div>

              {/* 이동 버튼 */}
              <div
                className={styles.submitButtonSection}
                style={{ gap: 12, display: "flex", flexWrap: "wrap" }}
              >
                <Link
                  to={`/reviews/${placeId}`}
                  className={styles.submitReviewButton}
                >
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>목록으로</div>
                  </div>
                </Link>

                <button
                  type="button"
                  className={styles.submitReviewButton}
                  onClick={() => navigate("/map")}
                >
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>지도로 가기</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          {/* end view */}
        </div>
      </div>
    </div>
  );
};
