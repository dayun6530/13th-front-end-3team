// src/pages/Review/Review.js
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Review.module.css";

export const ReviewPage = () => {
  const navigate = useNavigate();
  const { placeId } = useParams();

  const meta = JSON.parse(
    localStorage.getItem(`place:${placeId}`) || "null"
  ) || {
    name: "이름 정보 없음",
    addr: "주소 정보 없음",
  };

  // ✅ 텍스트만 작성
  const [text, setText] = useState("");
  const canSubmit = text.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      alert("리뷰 내용을 입력해 주세요.");
      return;
    }
    const key = `reviews:${placeId}`;
    const list = JSON.parse(localStorage.getItem(key) || "[]");

    // ✅ 새 스키마: likes 필드 포함, rating/recommend 없음
    list.push({
      id: String(Date.now()),
      placeId,
      text: text.trim(),
      likes: 0,
      createdAt: Date.now(),
    });

    localStorage.setItem(key, JSON.stringify(list));
    alert("리뷰가 등록되었습니다.");
    navigate(`/reviews/${placeId}`);
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
              <div className={styles.stationNameSection}>
                <div className={styles.stationName}>{meta.name}</div>
              </div>
              <div className={styles.stationAddressSection}>
                <div className={styles.stationAddress}>{meta.addr}</div>
              </div>

              {/* ✅ 별점/추천 섹션 제거 */}

              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>리뷰 작성</div>
              </div>
              <div className={styles.reviewInputArea}>
                <div className={styles.reviewInputContainer}>
                  <textarea
                    className={styles.reviewInputField}
                    rows={6}
                    placeholder="충전소 이용 후기를 자유롭게 적어주세요. (텍스트만)"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              </div>

              {/* ✅ 사진 추가 섹션 제거 */}

              <div className={styles.submitButtonSection}>
                <button
                  type="button"
                  className={styles.submitReviewButton}
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                >
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>리뷰 등록</div>
                  </div>
                </button>
              </div>

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
