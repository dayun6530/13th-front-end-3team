// src/pages/Review/ReviewDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import styles from "./Review.module.css";

const extractReviews = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.reviews)) return data.reviews;
  return [];
};

const cacheWrite = (placeId, list) =>
  localStorage.setItem(`reviews:${placeId}`, JSON.stringify(list));
const cacheRead = (placeId) =>
  extractReviews(
    JSON.parse(localStorage.getItem(`reviews:${placeId}`) || "[]")
  );

const norm = (r = {}) => {
  const text =
    r.reviewText ??
    r.text ??
    r.content ??
    r.review ??
    r.body ??
    r.contentText ??
    "";
  const rawTime =
    r.reviewTime ??
    r.createdAt ??
    r.created_at ??
    r.createdDate ??
    r.created_date ??
    r.writeTime ??
    r.time ??
    r.timestamp ??
    0;

  let createdTs = 0;
  if (typeof rawTime === "number") createdTs = rawTime;
  else if (typeof rawTime === "string") {
    const t = Date.parse(rawTime);
    createdTs = Number.isNaN(t) ? 0 : t;
  }

  return {
    id: String(r.id ?? r.reviewId ?? r.reviewID ?? r._id ?? r.uuid),
    text,
    likes: Number(r.likes ?? r.likeCount ?? 0),
    createdTs,
    userName:
      r.userName ??
      r.username ??
      r.nickname ??
      r.name ??
      r.writer ??
      r.author ??
      "익명",
  };
};

export const ReviewDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { placeId, reviewId } = useParams();
  const rid = String(reviewId);

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

  // 이미 좋아요 눌렀는지
  const [alreadyLiked, setAlreadyLiked] = useState(
    localStorage.getItem(`liked:${placeId}:${rid}`) === "1"
  );
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);

      // 1) 목록에서 state로 넘어온 리뷰 사용
      const fromState = location.state?.review;
      if (fromState?.id || fromState?.reviewId || fromState?._id) {
        if (!alive) return;
        setReview(norm(fromState));
        setLoading(false);
        return;
      }

      // 2) 서버에서 새로 받아와 찾기
      try {
        const { data } = await api.get(`/api/map/${placeId}`);
        const list = extractReviews(data);
        cacheWrite(placeId, list);

        const found = list.find(
          (r) =>
            String(r?.id ?? r?.reviewId ?? r?.reviewID ?? r?._id ?? r?.uuid) ===
            rid
        );
        if (alive) {
          setReview(found ? norm(found) : null);
          setLoading(false);
        }
        if (found) return;
      } catch {
        // 무시하고 폴백
      }

      // 3) 로컬 캐시 폴백
      const local = cacheRead(placeId);
      const f2 = local.find(
        (r) =>
          String(r?.id ?? r?.reviewId ?? r?.reviewID ?? r?._id ?? r?.uuid) ===
          rid
      );
      if (alive) {
        setReview(f2 ? norm(f2) : null);
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [placeId, rid, location.state]);

  const fmt = (ts) =>
    ts ? new Date(ts).toLocaleString() : "작성 시간 정보 없음";

  const likeThis = async () => {
    if (alreadyLiked || liking || !review) return;
    setLiking(true);

    // 낙관적 +1
    setReview((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : prev));

    try {
      await api.post(`/api/map/${placeId}/${rid}/like`);
    } catch (e) {
      console.warn("서버 좋아요 실패 → 로컬 유지", e);
      // 서버 실패여도 로컬 +1 유지
    } finally {
      setLiking(false);
      setAlreadyLiked(true);
      localStorage.setItem(`liked:${placeId}:${rid}`, "1");

      // 목록 캐시에도 반영(목록/상세 숫자 합산 유지)
      const cached = cacheRead(placeId);
      const next = cached.map((r) => {
        const id = String(r.id ?? r.reviewId ?? r.reviewID ?? r._id ?? r.uuid);
        if (id === rid) {
          const likes = Number(r.likes ?? r.likeCount ?? 0) + 1;
          return { ...r, likes };
        }
        return r;
      });
      cacheWrite(placeId, next);
    }
  };

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

              {/* ❤️ 좋아요 버튼 (1회만) */}
              <div className={styles.submitButtonSection}>
                <button
                  type="button"
                  className={styles.submitReviewButton}
                  onClick={likeThis}
                  disabled={alreadyLiked || liking}
                  title={alreadyLiked ? "이미 좋아요를 눌렀습니다" : "좋아요"}
                >
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>
                      ❤️ 좋아요 {review.likes || 0}
                    </div>
                  </div>
                </button>
              </div>

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
