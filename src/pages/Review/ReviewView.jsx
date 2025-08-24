// src/pages/Review/ReviewView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import styles from "./Review.module.css";

/* 서버 응답이 배열/객체(reviews 속성) 어떤 형태든 안전하게 뽑기 */
const extractReviews = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.reviews)) return data.reviews;
  return [];
};

const readList = (placeId) =>
  extractReviews(
    JSON.parse(localStorage.getItem(`reviews:${placeId}`) || "[]")
  );

const writeList = (placeId, list) =>
  localStorage.setItem(`reviews:${placeId}`, JSON.stringify(list));

/* 다양한 백엔드/로컬 키 대응 */
const norm = (r = {}) => {
  const text =
    r.reviewText ??
    r.text ??
    r.content ??
    r.review ?? // 추가
    r.body ?? // 추가
    r.contentText ?? // 추가
    "";

  const rawTime =
    r.reviewTime ??
    r.createdAt ??
    r.created_at ??
    r.createdDate ??
    r.created_date ?? // 추가
    r.writeTime ?? // 추가
    r.time ?? // 추가
    r.timestamp ?? // 추가
    0;

  let createdTs = 0;
  if (typeof rawTime === "number") {
    createdTs = rawTime;
  } else if (typeof rawTime === "string") {
    const t = Date.parse(rawTime);
    createdTs = Number.isNaN(t) ? 0 : t;
  }

  return {
    id: r.id ?? r.reviewId ?? r.reviewID ?? r._id ?? r.uuid,
    text,
    createdTs,
    userName:
      r.userName ??
      r.username ??
      r.nickname ??
      r.name ??
      r.writer ?? // 추가
      r.author ?? // 추가
      "익명",
  };
};

export const ReviewViewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { placeId, reviewId } = useParams();

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
  const [loading, setLoading] = useState(true);

  // 로드 순서: 1) 라우트 state → 2) 서버 → 3) 로컬 캐시
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      // 1) 목록에서 state로 전달된 원본 사용
      const fromState = location.state?.review;
      if (fromState?.id || fromState?.reviewId || fromState?._id) {
        if (!alive) return;
        setReview(norm(fromState));
        setLoading(false);
        return;
      }

      // 2) 서버에서 새로 가져오기
      try {
        const { data } = await api.get(`/api/map/${placeId}`);
        const list = extractReviews(data);
        writeList(placeId, list);

        const found = list.find(
          (r) =>
            String(r?.id ?? r?.reviewId ?? r?.reviewID ?? r?._id ?? r?.uuid) ===
            String(reviewId)
        );
        if (alive) {
          setReview(found ? norm(found) : null);
          setLoading(false);
        }
        if (found) return;
      } catch {
        // 실패 시 폴백
      }

      // 3) 로컬 캐시 폴백
      const local = readList(placeId);
      const f2 = local.find(
        (r) =>
          String(r?.id ?? r?.reviewId ?? r?.reviewID ?? r?._id ?? r?.uuid) ===
          String(reviewId)
      );
      if (alive) {
        setReview(f2 ? norm(f2) : null);
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [placeId, reviewId, location.state]);

  if (loading) {
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
                  <div className={styles.sectionTitle}>불러오는 중…</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              </div>
            </div>
            {/* end empty */}
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
                <div className={styles.sectionTitle}>리뷰 내용</div>
              </div>
              <div className={styles.reviewInputArea}>
                <div className={styles.reviewInputContainer}>
                  <div
                    className={styles.reviewInputField}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {review.text || "(내용 없음)"}
                  </div>
                </div>
              </div>

              <p className={styles.stationAddress}>
                작성자: {review.userName} | 작성일:{" "}
                {review.createdTs
                  ? new Date(review.createdTs).toLocaleString()
                  : "작성 시간 정보 없음"}
              </p>

              {/* 👍 상세 페이지에서는 좋아요 버튼/카운트 완전히 제거 */}

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
