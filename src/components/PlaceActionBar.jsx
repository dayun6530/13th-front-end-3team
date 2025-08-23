import React, { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useSearchParams,
  useNavigate,
  useParams,
} from "react-router-dom";

/**
 * UI 전용 액션바
 * - ctx === 'station'  : 리뷰 작성/보기 + 좋아요
 * - ctx === 'biz'      : 좋아요만
 * - 좋아요: 로컬스토리지 토글 (네트워크 없음)
 *
 * URL 규칙 가정:
 *   상세가 /map/:placeId 라우트라면 useParams로 placeId 인식
 *   아니라면 placeId를 prop으로 넘겨줘도 됨(아래 B안 참고)
 */
export default function PlaceActionBar({ placeId: propPlaceId }) {
  const navigate = useNavigate();
  const params = useParams();
  const { placeId: urlPlaceId } = params || {};
  const placeId = propPlaceId || urlPlaceId;

  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 우선순위: state → query → 기본값('station')
  const ctx = useMemo(
    () => location.state?.ctx || searchParams.get("ctx") || "station",
    [location.state, searchParams]
  );

  // --- 좋아요 로컬 스토리지 ---
  const likeKey = `likes:${placeId}`;
  const [liked, setLiked] = useState(false);
  useEffect(() => {
    setLiked(!!JSON.parse(localStorage.getItem(likeKey) || "false"));
  }, [likeKey]);

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    localStorage.setItem(likeKey, JSON.stringify(next));
  };

  // ↓ 너희 라우트에 맞춰 경로만 바꾸면 됨
  const goWriteReview = () => navigate(`/review?placeId=${placeId}`); // 작성: Review.jsx
  const goReviewList = () => navigate(`/review/list?placeId=${placeId}`); // 목록: ReviewList.jsx

  return (
    <div className="action-bar">
      {ctx === "station" && (
        <>
          <button type="button" className="btn" onClick={goWriteReview}>
            리뷰 작성
          </button>
          <button type="button" className="btn" onClick={goReviewList}>
            리뷰 보기
          </button>
        </>
      )}

      <button type="button" className="btn" onClick={toggleLike}>
        {liked ? "좋아요 취소" : "좋아요"}
      </button>
    </div>
  );
}
