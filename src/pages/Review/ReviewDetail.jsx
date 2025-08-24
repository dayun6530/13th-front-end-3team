// src/pages/Review/ReviewDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import styles from "./Review.module.css";

/* 서버 응답이 배열/객체(reviews 속성) 어떤 형태든 안전하게 리스트 뽑기 */
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

/* 다양한 백엔드/로컬 키 대응 후 표준화 */
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

  // 상태
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  // 좋아요 1회 제한
  const [alreadyLiked, setAlreadyLiked] = useState(
    localStorage.getItem(`liked:${placeId}:${rid}`) === "1"
  );
  const [liking, setLiking] = useState(false);

  // 삭제 진행 상태
  const [deleting, setDeleting] = useState(false);

  // 인라인 수정 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editPw, setEditPw] = useState("");
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  // 로드 순서: 1) 라우트 state → 2) 서버 → 3) 로컬 캐시
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      // 1) 목록에서 state로 전달된 원본 리뷰 사용
      const fromState = location.state?.review;
      if (fromState?.id || fromState?.reviewId || fromState?._id) {
        if (!alive) return;
        const n = norm(fromState);
        setReview(n);
        setEditText(n.text || "");
        setLoading(false);
        return;
      }

      // 2) 서버에서 최신 목록 받아서 찾기
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
          const n = found ? norm(found) : null;
          setReview(n);
          setEditText(n?.text || "");
          setLoading(false);
        }
        if (found) return;
      } catch {
        // 실패 시 폴백으로 진행
      }

      // 3) 로컬 캐시 폴백
      const local = cacheRead(placeId);
      const f2 = local.find(
        (r) =>
          String(r?.id ?? r?.reviewId ?? r?.reviewID ?? r?._id ?? r?.uuid) ===
          rid
      );
      if (alive) {
        const n = f2 ? norm(f2) : null;
        setReview(n);
        setEditText(n?.text || "");
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [placeId, rid, location.state]);

  const fmt = (ts) =>
    ts ? new Date(ts).toLocaleString() : "작성 시간 정보 없음";

  /** ❤️ 좋아요: 서버 시도 → 실패해도 로컬 +1 유지, 1회 제한 */
  const likeThis = async () => {
    if (alreadyLiked || liking || !review) return;
    setLiking(true);

    // 낙관적 +1 (즉시 증가)
    setReview((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : prev));

    try {
      await api.post(`/api/map/${placeId}/${rid}/like`);
    } catch (e) {
      console.warn("서버 좋아요 실패 → 로컬 유지", e);
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

  /** 🗑️ 삭제: 비밀번호 확인 → 서버 DELETE → 성공 시 목록으로 */
  const deleteReview = async () => {
    if (!review || deleting) return;
    const pw = window.prompt("리뷰를 삭제하려면 비밀번호를 입력하세요.");
    if (pw === null) return; // 취소
    if (!pw.trim()) {
      alert("비밀번호를 입력해 주세요.");
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/api/map/${placeId}/${rid}`, {
        params: { password: pw.trim() },
      });

      // 캐시에서도 제거
      const cached = cacheRead(placeId);
      cacheWrite(
        placeId,
        cached.filter((r) => {
          const id = String(
            r.id ?? r.reviewId ?? r.reviewID ?? r._id ?? r.uuid
          );
          return id !== rid;
        })
      );

      alert("리뷰가 삭제되었습니다.");
      navigate(`/reviews/${placeId}`);
    } catch (e) {
      const status = e?.response?.status;
      let msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.response?.data ||
        "";
      if (!msg) {
        if (status === 403) msg = "비밀번호가 일치하지 않습니다.";
        else if (status === 404) msg = "리뷰를 찾을 수 없습니다.";
        else if (status === 500) msg = "서버 오류로 삭제에 실패했습니다.";
        else msg = "삭제 중 오류가 발생했습니다.";
      }
      alert(String(msg));
    } finally {
      setDeleting(false);
    }
  };

  /** ✏️ 인라인 수정: 비밀번호 + 본문 → 서버 PATCH (CORS 실패 시 편집 유지) */
  const saveEdit = async () => {
    if (!review || saving) return;
    const pw = editPw.trim();
    const text = editText.trim();

    if (!pw) {
      alert("비밀번호를 입력해 주세요.");
      return;
    }
    if (!text) {
      alert("수정할 내용을 입력해 주세요.");
      return;
    }

    setSaving(true);
    try {
      // 서버 컨트롤러가 Map<String,Object>에서 "비밀번호", "리뷰" 키를 사용
      const body = { ["비밀번호"]: pw, ["리뷰"]: text };
      const { data } = await api.patch(`/api/map/${placeId}/${rid}`, body);

      // 성공: 화면/캐시 갱신
      const updated = norm(data || {});
      const nextText = updated.text || text;
      setReview((prev) => (prev ? { ...prev, text: nextText } : prev));

      const cached = cacheRead(placeId);
      const next = cached.map((r) => {
        const id = String(r.id ?? r.reviewId ?? r.reviewID ?? r._id ?? r.uuid);
        if (id === rid) {
          return { ...r, reviewText: nextText, text: nextText };
        }
        return r;
      });
      cacheWrite(placeId, next);

      setIsEditing(false);
      setEditPw("");
      alert("리뷰가 수정되었습니다.");
    } catch (e) {
      // CORS 차단일 경우 e.response가 없고 "Network Error"일 가능성이 큼
      if (!e?.response) {
        alert(
          "수정 요청이 차단되었습니다.\n서버 CORS 설정에 PATCH를 허용해 주세요.\n(Access-Control-Allow-Methods에 PATCH 추가)"
        );
      } else {
        const status = e.response.status;
        let msg =
          e.response.data?.message ||
          e.response.data?.error ||
          e.response.data ||
          "";
        if (!msg) {
          if (status === 403) msg = "비밀번호가 일치하지 않습니다.";
          else if (status === 404) msg = "리뷰를 찾을 수 없습니다.";
          else if (status === 500) msg = "서버 오류로 수정에 실패했습니다.";
          else msg = "수정 중 오류가 발생했습니다.";
        }
        alert(String(msg));
      }
      // 실패 시 편집 모드 유지
    } finally {
      setSaving(false);
    }
  };

  // --- 렌더 ---
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

              {/* 본문/편집 */}
              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>리뷰 내용</div>
              </div>

              {!isEditing ? (
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
              ) : (
                <div className={styles.reviewInputArea}>
                  <div className={styles.reviewInputContainer}>
                    <textarea
                      className={styles.reviewInputField}
                      rows={6}
                      placeholder="수정할 내용을 입력하세요."
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <input
                      type="password"
                      placeholder="비밀번호"
                      value={editPw}
                      onChange={(e) => setEditPw(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #e5e8ea",
                        outline: "none",
                        background: "#fff",
                      }}
                    />
                  </div>

                  <div
                    className={styles.submitButtonSection}
                    style={{ gap: 8, display: "flex", flexWrap: "wrap" }}
                  >
                    <button
                      type="button"
                      className={styles.submitReviewButton}
                      onClick={saveEdit}
                      disabled={saving}
                    >
                      <div className={styles.buttonTextWrapper}>
                        <div className={styles.buttonText}>
                          {saving ? "저장 중…" : "수정 완료"}
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={styles.submitReviewButton}
                      onClick={() => {
                        setIsEditing(false);
                        setEditPw("");
                        setEditText(review.text || "");
                      }}
                      disabled={saving}
                    >
                      <div className={styles.buttonTextWrapper}>
                        <div className={styles.buttonText}>취소</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* 작성자/작성일 + 수정/삭제 버튼(우측) */}
              <div
                className={styles.stationAddress}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span>
                  작성자: {review.userName} | 작성일: {fmt(review.createdTs)}
                </span>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setEditText(review.text || "");
                      setEditPw("");
                    }}
                    disabled={isEditing}
                    title="리뷰 수정"
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid #2e7d32",
                      background: isEditing ? "#d9f7d9" : "#e9fbe9",
                      color: "#1b5e20",
                      fontWeight: 700,
                      cursor: isEditing ? "not-allowed" : "pointer",
                    }}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={deleteReview}
                    disabled={deleting}
                    title="리뷰 삭제"
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid #ff5a5a",
                      background: deleting ? "#ffdede" : "#ffecec",
                      color: "#b00020",
                      fontWeight: 700,
                      cursor: deleting ? "not-allowed" : "pointer",
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>

              {/* 좋아요(1회) + 이동 버튼 */}
              <div
                className={styles.submitButtonSection}
                style={{ gap: 12, display: "flex", flexWrap: "wrap" }}
              >
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
