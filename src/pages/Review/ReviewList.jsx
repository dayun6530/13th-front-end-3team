// src/pages/Review/ReviewList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import styles from "./Review.module.css";
import api from "../../api/axios"; // axios 인스턴스

// ---------- 서버 응답 안전 추출 ----------
const extractReviews = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.reviews)) return data.reviews;
  return [];
};

const getMeta = (placeId) =>
  JSON.parse(localStorage.getItem(`place:${placeId}`) || "null") || {
    name: "이름 정보 없음",
    addr: "주소 정보 없음",
  };

const cacheWrite = (placeId, list) =>
  localStorage.setItem(`reviews:${placeId}`, JSON.stringify(list));
const cacheRead = (placeId) =>
  extractReviews(
    JSON.parse(localStorage.getItem(`reviews:${placeId}`) || "[]")
  );

// ---------- 요약 카드 ----------
function ReviewSummaryCard({ placeId }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const DEMO_MODE = true;

  const load = async () => {
    setLoading(true);
    setError(null);
    if (DEMO_MODE) {
      setTimeout(() => {
        setItems([
          "대기 공간이 쾌적하고 안내가 친절해요.",
          "피크 시간에도 충전 속도가 안정적이에요.",
          "주차 동선이 좁아 초보 운전자는 주의가 필요해요.",
          "결제 오류 없이 원활하게 이용했어요.",
          "주변 편의시설(카페/편의점)이 가까워요.",
        ]);
        setLoading(false);
      }, 350);
      return;
    }
    setItems([]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [placeId]);

  return (
    <div
      role="region"
      aria-live="polite"
      style={{
        marginTop: 16,
        marginBottom: 16,
        border: "1px solid #e5e8ea",
        borderRadius: 12,
        background: "#fff",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div style={{ fontWeight: 700 }}>최신 리뷰 요약 (최근 5개)</div>
        <button
          type="button"
          onClick={load}
          title="요약 새로고침"
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #e5e8ea",
            background: "#f7f9fa",
            cursor: "pointer",
          }}
        >
          ⟳ 새로고침
        </button>
      </div>

      {loading && (
        <div style={{ display: "grid", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 12,
                borderRadius: 6,
                background:
                  "linear-gradient(90deg, #f0f3f5 25%, #e6eaee 37%, #f0f3f5 63%)",
                backgroundSize: "400% 100%",
                animation: "shimmer 1.6s infinite",
              }}
            />
          ))}
          <style>{`
            @keyframes shimmer {
              0% { background-position: 100% 0; }
              100% { background-position: 0 0; }
            }
          `}</style>
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            background: "#fff7e6",
            color: "#7a5400",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {items.length ? (
            <ul style={{ margin: "6px 0 0 16px", padding: 0, lineHeight: 1.6 }}>
              {items.slice(0, 5).map((line, idx) => (
                <li key={idx} style={{ marginBottom: 6, color: "#333" }}>
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ color: "#637787" }}>
              요약이 아직 없어요. 리뷰가 모이면 보여드릴게요.
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------- 목록 페이지 ----------
export const ReviewListPage = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();

  const meta = getMeta(placeId);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // 좋아요 중/이미 좋아요 여부
  const [liking, setLiking] = useState({}); // id -> boolean
  const [likedMap, setLikedMap] = useState({}); // id -> boolean

  // 목록 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await api.get(`/api/map/${placeId}`);
        if (!alive) return;
        const rows = extractReviews(data);
        setList(rows);
        cacheWrite(placeId, rows);
      } catch (e) {
        console.error(e);
        if (alive) {
          // 서버 실패 시 로컬 캐시라도 사용
          const cached = cacheRead(placeId);
          if (cached.length) setList(cached);
          else setErr("리뷰를 불러오지 못했습니다.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [placeId]);

  // 처음 로딩 시 localStorage의 “이미 좋아요” 여부를 맵으로 구성
  useEffect(() => {
    const map = {};
    list.forEach((r) => {
      const id = String(r.id ?? r.reviewId ?? r.reviewID);
      map[id] = localStorage.getItem(`liked:${placeId}:${id}`) === "1";
    });
    setLikedMap(map);
  }, [list, placeId]);

  // ----- 정렬 유틸 -----
  const getLikes = (r) => Number(r.likes ?? r.likeCount ?? 0);
  const getCreatedTs = (r) => {
    const raw = r.reviewTime ?? r.createdAt ?? r.created_at ?? r.createdDate;
    if (typeof raw === "number") return raw;
    const t = Date.parse(raw);
    return Number.isNaN(t) ? 0 : t;
  };
  const getText = (r) => r.reviewText ?? r.text ?? r.content ?? "";
  const getUser = (r) =>
    r.userName ?? r.username ?? r.nickname ?? r.name ?? "익명";
  const snippet = (t = "") => (t.length > 40 ? t.slice(0, 40) + "…" : t);
  const fmt = (ts) => (ts ? new Date(ts).toLocaleString() : "");

  // 👍 좋아요 내림차순 → 작성일 내림차순
  const sorted = useMemo(() => {
    return [...list]
      .map((r) => ({ ...r, _likes: getLikes(r), _ts: getCreatedTs(r) }))
      .sort((a, b) => {
        const dl = b._likes - a._likes;
        return dl !== 0 ? dl : b._ts - a._ts;
      });
  }, [list]);

  // 좋아요 클릭 (목록용)
  const handleLike = async (e, rawId) => {
    e.preventDefault(); // Link 이동 막기
    e.stopPropagation();

    const id = String(rawId);
    if (likedMap[id]) return; // 이미 눌렀으면 무시

    // 낙관적 업데이트
    setLiking((s) => ({ ...s, [id]: true }));
    setList((prev) =>
      prev.map((r) => {
        const rid = String(r.id ?? r.reviewId ?? r.reviewID);
        if (rid === id) {
          const cur = getLikes(r);
          return { ...r, likes: cur + 1 };
        }
        return r;
      })
    );

    try {
      await api.post(`/api/map/${placeId}/${id}/like`);
    } catch (e2) {
      console.warn("서버 좋아요 실패 → 로컬 유지", e2);
      // 서버 실패여도 로컬 +1은 유지 (원하면 되돌리기도 가능)
    } finally {
      setLiking((s) => ({ ...s, [id]: false }));
      setLikedMap((s) => ({ ...s, [id]: true }));
      localStorage.setItem(`liked:${placeId}:${id}`, "1");

      // 최신 목록을 로컬 캐시에 저장(상세와 합산 위해)
      const nextList = ((prev) => prev)();
      // trick: 최신 list를 가져오기 위해 setList의 콜백을 쓰지 못하니, 상태를 한 번 읽어 써준다.
      // 위 trick 대신 현재 상태의 list를 그대로 저장
      cacheWrite(
        placeId,
        list.map((r) => {
          const rid = String(r.id ?? r.reviewId ?? r.reviewID);
          if (rid === id) {
            const cur = getLikes(r);
            return { ...r, likes: cur + (likedMap[id] ? 0 : 1) };
          }
          return r;
        })
      );
    }
  };

  // ----- 상태별 렌더 -----
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

                <ReviewSummaryCard placeId={placeId} />

                <div className={styles.sectionTitleWrapper}>
                  <div className={styles.sectionTitle}>불러오는 중…</div>
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
            {/* end loading */}
          </div>
        </div>
      </div>
    );
  }

  if (err) {
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

                <ReviewSummaryCard placeId={placeId} />

                <div className={styles.sectionTitleWrapper}>
                  <div className={styles.sectionTitle}>{err}</div>
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
                  <Link to="/map" className={styles.submitReviewButton}>
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>지도로 가기</div>
                    </div>
                  </Link>
                </div>

                <div className={styles.submitButtonSection}>
                  <button
                    className={styles.submitReviewButton}
                    onClick={() => window.location.reload()}
                  >
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>다시 시도</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            {/* end error */}
          </div>
        </div>
      </div>
    );
  }

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

                <ReviewSummaryCard placeId={placeId} />

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
                  <Link to="/map" className={styles.submitReviewButton}>
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>지도로 가기</div>
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
            {/* end empty */}
          </div>
        </div>
      </div>
    );
  }

  // ----- 목록 -----
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

              <ReviewSummaryCard placeId={placeId} />

              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>
                  리뷰 목록{" "}
                  <span style={{ color: "#637787" }}>(좋아요 많은 순)</span>
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {sorted.map((r) => {
                  const id = String(r.id ?? r.reviewId ?? r.reviewID);
                  const likes = Number(r._likes ?? r.likes ?? 0);
                  const ts = r._ts ?? getCreatedTs(r);
                  const disabled = !!likedMap[id] || !!liking[id];

                  return (
                    <div
                      key={id}
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
                      <Link
                        to={`/reviews/${placeId}/${id}`}
                        state={{ review: r }} // 상세로 원본 전달(미스매치 방지)
                        style={{
                          flex: 1,
                          textDecoration: "none",
                          color: "inherit",
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div style={{ color: "#444" }}>
                          {snippet(getText(r))}
                        </div>
                        <div style={{ whiteSpace: "nowrap", color: "#637787" }}>
                          {fmt(ts)} · {getUser(r)}
                        </div>
                      </Link>

                      <button
                        type="button"
                        disabled={disabled}
                        onClick={(e) => handleLike(e, id)}
                        title={disabled ? "이미 좋아요를 눌렀습니다" : "좋아요"}
                        style={{
                          alignSelf: "flex-start",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: "1px solid #e5e8ea",
                          background: disabled ? "#f3f5f7" : "#fff",
                          cursor: disabled ? "not-allowed" : "pointer",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        ❤️ {likes}
                      </button>
                    </div>
                  );
                })}
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
