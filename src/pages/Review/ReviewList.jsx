// src/pages/Review/ReviewList.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import styles from "./Review.module.css";

const getMeta = (placeId) =>
  JSON.parse(localStorage.getItem(`place:${placeId}`) || "null");

const getList = (placeId) =>
  JSON.parse(localStorage.getItem(`reviews:${placeId}`) || "[]");

/** ===============================
 *  최신 리뷰 요약 UI (백엔드 연동 예정)
 *  위치: 주소 아래, 리뷰 목록 위
 *  =============================== */
function ReviewSummaryCard({ placeId }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]); // ['문장1', '문장2', ...]
  const [error, setError] = useState(null);

  const DEMO_MODE = true; // ⚠️ 백엔드 붙이면 false로 바꾸고 실제 fetch로 교체

  const load = () => {
    setLoading(true);
    setError(null);

    if (DEMO_MODE) {
      // 데모: 잠깐 로딩 후 더미 요약 5개
      setTimeout(() => {
        setItems([
          "대기 공간이 쾌적하고 안내가 친절해요.",
          "피크 시간에도 충전 속도가 안정적이에요.",
          "주차 동선이 좁아 초보 운전자는 주의가 필요해요.",
          "결제 오류 없이 원활하게 이용했어요.",
          "주변 편의시설(카페/편의점)이 가까워요.",
        ]);
        setLoading(false);
      }, 400);
      return;
    }

    // TODO: 백엔드 연동 (예시)
    // fetch(`/api/reviews/${placeId}/summary?limit=5`)
    //   .then((r) => (r.ok ? r.json() : Promise.reject(r)))
    //   .then((data) => {
    //     // data.items 가 ['문장1', ...] 형태라고 가정
    //     setItems(Array.isArray(data.items) ? data.items.slice(0, 5) : []);
    //     setLoading(false);
    //   })
    //   .catch(() => {
    //     setError("요약을 불러오는 중 문제가 발생했어요.");
    //     setLoading(false);
    //   });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

export const ReviewListPage = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();

  const meta = getMeta(placeId) || {
    name: "이름 정보 없음",
    addr: "주소 정보 없음",
  };
  const list = getList(placeId);

  const snippet = (t = "") => (t.length > 40 ? t.slice(0, 40) + "…" : t);
  const fmt = (ts) => new Date(ts).toLocaleString();

  // --- 리뷰 없음 화면 ---
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

                {/* ▼ 요약 카드: 주소 아래, 목록 위 */}
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

  // --- 리뷰 목록 화면 ---
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

              {/* ▼ 요약 카드: 주소 아래, 목록 위 */}
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
                {list
                  .map((r) => ({ likes: 0, ...r })) // likes 기본값
                  .sort((a, b) => (b.likes || 0) - (a.likes || 0))
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
                        <div style={{ color: "#444" }}>{snippet(r.text)}</div>
                        <div style={{ whiteSpace: "nowrap", color: "#637787" }}>
                          {fmt(r.createdAt)}
                        </div>
                      </div>

                      {/* 좋아요 카운트만 표시 (목록에서는 누르는 버튼은 별도 구현했었으면 유지) */}
                      <div
                        title="좋아요 수"
                        style={{
                          alignSelf: "flex-start",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: "1px solid #e5e8ea",
                          background: "#fff",
                          whiteSpace: "nowrap",
                          fontWeight: 700,
                        }}
                      >
                        ❤️ {r.likes || 0}
                      </div>
                    </Link>
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
