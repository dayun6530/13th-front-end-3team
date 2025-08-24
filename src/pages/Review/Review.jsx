// src/pages/Review/Review.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import styles from "./Review.module.css";

export const ReviewPage = () => {
  const navigate = useNavigate();
  const { placeId } = useParams();

  // 장소 메타 (로컬에 저장해둔 이름/주소)
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

  // 작성 폼 상태
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    nickname.trim().length > 0 &&
    password.trim().length > 0 &&
    text.trim().length > 0 &&
    !submitting;

  // --- 유틸: 로컬 임시 저장 (서버 실패 폴백) ---
  const saveLocalFallback = () => {
    const key = `reviews:${placeId}`;
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    const now = Date.now();
    list.push({
      id: String(now),
      placeId,
      userName: nickname.trim(),
      text: text.trim(), // 로컬 포맷
      likes: 0,
      createdAt: now,
      _local: true,
    });
    localStorage.setItem(key, JSON.stringify(list));
  };

  // --- 유틸: 서버에 방금 리뷰가 반영됐는지 검증(GET) ---
  // 백엔드 ReviewResponse 필드: id, userName, chargingStationId, reviewTime, likes, reviewText
  const verifySavedOnServer = async () => {
    try {
      const { data } = await api.get(`/api/map/${placeId}`);
      if (!Array.isArray(data)) return false;

      const now = Date.now();
      const found = data.find((r) => {
        const sameUser = String(r.userName || "").trim() === nickname.trim();
        const sameText = String(r.reviewText || "").trim() === text.trim();
        const ts = Date.parse(r.reviewTime || "") || 0;
        const recent = ts && Math.abs(now - ts) < 5 * 60 * 1000; // 5분 이내
        return sameUser && sameText && recent;
      });

      return !!found;
    } catch {
      return false;
    }
  };

  // --- 제출 ---
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // 백엔드 컨트롤러가 한글 키를 요구: "사용자명" / "비밀번호" / "리뷰"
      const payload = {
        사용자명: nickname.trim(),
        비밀번호: password.trim(),
        리뷰: text.trim(),
      };

      await api.post(`/api/map/${placeId}`, payload);

      // 정상 응답이면 바로 성공 처리
      alert("리뷰가 등록되었습니다.");
      navigate(`/reviews/${placeId}`);
    } catch (err) {
      // 500 등 오류여도 실제 저장은 됐는지 확인
      const saved = await verifySavedOnServer();
      if (saved) {
        alert(
          "리뷰는 등록되었지만 서버 응답에서 오류(500)가 발생했습니다.\n목록을 새로고침하면 확인할 수 있어요."
        );
        navigate(`/reviews/${placeId}`);
      } else {
        // 정말 실패 → 로컬 임시 저장
        console.error("[리뷰 등록 실패 → 로컬 임시 저장]", err);
        saveLocalFallback();
        alert(
          "서버 오류로 리뷰를 임시 저장했습니다.\n네트워크/서버 상태가 안정되면 다시 시도해 주세요."
        );
        navigate(`/reviews/${placeId}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

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
              {/* 장소 이름/주소 */}
              <div className={styles.stationNameSection}>
                <div className={styles.stationName}>{meta.name}</div>
              </div>
              <div className={styles.stationAddressSection}>
                <div className={styles.stationAddress}>{meta.addr}</div>
              </div>

              {/* 작성 폼 */}
              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>리뷰 작성</div>
              </div>

              <div className={styles.reviewInputArea}>
                {/* 닉네임 */}
                <div className={styles.reviewInputContainer}>
                  <input
                    type="text"
                    className={styles.reviewInputField}
                    placeholder="닉네임을 입력해 주세요"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={20}
                    required
                  />
                </div>

                {/* 비밀번호 */}
                <div className={styles.reviewInputContainer}>
                  <input
                    type="password"
                    className={styles.reviewInputField}
                    placeholder="비밀번호를 입력해 주세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={50}
                    required
                  />
                </div>

                {/* 리뷰 본문 */}
                <div className={styles.reviewInputContainer}>
                  <textarea
                    className={styles.reviewInputField}
                    rows={6}
                    placeholder="충전소 이용 후기를 자유롭게 적어주세요. (텍스트만)"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 제출 버튼 */}
              <div className={styles.submitButtonSection}>
                <button
                  type="button"
                  className={styles.submitReviewButton}
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  aria-disabled={!canSubmit}
                >
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>
                      {submitting ? "등록 중…" : "리뷰 등록"}
                    </div>
                  </div>
                </button>
              </div>

              {/* 뒤로가기 */}
              <div className={styles.submitButtonSection}>
                <button
                  type="button"
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
          {/* end form */}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
