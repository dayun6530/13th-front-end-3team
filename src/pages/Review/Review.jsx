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

  const [rating, setRating] = useState(0);
  const [recommend, setRecommend] = useState(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);

  const canSubmit = rating > 0 && recommend !== null && text.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit)
      return alert("별점, 추천 여부, 리뷰 내용을 모두 입력해 주세요.");
    const key = `reviews:${placeId}`;
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.push({
      id: String(Date.now()),
      placeId,
      rating,
      recommend,
      text,
      photosCount: files.length,
      createdAt: Date.now(),
    });
    localStorage.setItem(key, JSON.stringify(list));
    alert("리뷰가 등록되었습니다.");
    navigate(`/reviews/${placeId}`); // ← 작성 직후 '그 장소'의 목록으로 이동
  };

  const selectedStar = {
    backgroundColor: "#00C2AD",
    color: "#fff",
    borderColor: "#00C2AD",
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

              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>별점</div>
              </div>
              <div className={styles.starRatingSection}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={styles.starRatingButton}
                    style={rating >= n ? selectedStar : undefined}
                    onClick={() => setRating(n)}
                  >
                    <div className={styles.starRatingValue}>{n}</div>
                  </div>
                ))}
              </div>

              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>추천 여부</div>
              </div>
              <div className={styles.recommendationSection}>
                <div className={styles.recommendationButtons}>
                  <div
                    className={`${styles.recommendButton} ${
                      recommend === true ? styles.btnActive : styles.btnInactive
                    }`}
                    onClick={() => setRecommend(true)}
                  >
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>추천</div>
                    </div>
                  </div>
                  <div
                    className={`${styles.disrecommendButton} ${
                      recommend === false
                        ? styles.btnActive
                        : styles.btnInactive
                    }`}
                    onClick={() => setRecommend(false)}
                  >
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>비추천</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>리뷰 작성</div>
              </div>
              <div className={styles.reviewInputArea}>
                <div className={styles.reviewInputContainer}>
                  <textarea
                    className={styles.reviewInputField}
                    rows={6}
                    placeholder="리뷰를 입력하세요."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>(옵션) 사진 추가</div>
              </div>
              <div className={styles.photoUploadSection}>
                <div className={styles.photoUploadContent}>
                  <div className={styles.photoUploadTextInfo}>
                    <div className={styles.photoUploadTitleWrapper}>
                      <div className={styles.photoUploadTitle}>사진 추가</div>
                    </div>
                    <div className={styles.photoUploadDescriptionWrapper}>
                      <p className={styles.photoUploadDescription}>
                        사진을 추가하여 리뷰를 더욱 풍성하게 만들어보세요.
                      </p>
                      {files.length > 0 && (
                        <p className={styles.photoUploadDescription}>
                          선택된 사진: {files.length}장
                        </p>
                      )}
                    </div>
                  </div>
                  <input
                    id="review-photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="review-photos"
                    className={styles.addPhotoButton}
                  >
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>사진 추가</div>
                    </div>
                  </label>
                </div>
              </div>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
