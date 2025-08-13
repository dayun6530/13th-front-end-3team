// src/pages/Review/Review.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Review.module.css";

const STATION_ID = "station-green-energy";
const STATION_NAME = "그린 에너지 충전소";
const STATION_ADDR = "서울시 강남구 테헤란로 123";

export const ReviewPage = () => {
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [recommend, setRecommend] = useState(null); // true | false | null
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);

  const onPickFiles = (e) => setFiles(Array.from(e.target.files || []));
  const canSubmit = rating > 0 && recommend !== null && text.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      alert("별점, 추천 여부, 리뷰 내용을 모두 입력해 주세요.");
      return;
    }
    const payload = {
      stationId: STATION_ID,
      stationName: STATION_NAME,
      rating,
      recommend,
      text,
      photosCount: files.length,
      createdAt: Date.now(),
    };
    localStorage.setItem(`review:${STATION_ID}`, JSON.stringify(payload));
    alert("리뷰가 등록되었습니다.");
    navigate("/mypage");
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
                <div className={styles.stationName}>{STATION_NAME}</div>
              </div>
              <div className={styles.stationAddressSection}>
                <div className={styles.stationAddress}>{STATION_ADDR}</div>
              </div>

              {/* 별점 */}
              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>별점</div>
              </div>
              <div
                className={styles.starRatingSection}
                role="radiogroup"
                aria-label="별점 선택"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    role="radio"
                    aria-checked={rating === n}
                    tabIndex={0}
                    onClick={() => setRating(n)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && setRating(n)
                    }
                    className={styles.starRatingButton}
                    style={rating >= n ? selectedStar : undefined}
                  >
                    <div className={styles.starRatingValue}>{n}</div>
                  </div>
                ))}
              </div>

              {/* 추천 여부 */}
              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>추천 여부</div>
              </div>
              <div className={styles.recommendationSection}>
                <div className={styles.recommendationButtons}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-pressed={recommend === true}
                    onClick={() => setRecommend(true)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && setRecommend(true)
                    }
                    className={`${styles.recommendButton} ${
                      recommend === true ? styles.btnActive : styles.btnInactive
                    }`}
                  >
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>추천</div>
                    </div>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    aria-pressed={recommend === false}
                    onClick={() => setRecommend(false)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      setRecommend(false)
                    }
                    className={`${styles.disrecommendButton} ${
                      recommend === false
                        ? styles.btnActive
                        : styles.btnInactive
                    }`}
                  >
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>비추천</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 리뷰 작성 */}
              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>리뷰 작성</div>
              </div>
              <div className={styles.reviewInputArea}>
                <div className={styles.reviewInputContainer}>
                  <textarea
                    className={styles.reviewInputField}
                    placeholder="리뷰를 입력하세요."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>

              {/* 사진 추가 */}
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
                    onChange={onPickFiles}
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

              {/* 등록 버튼 */}
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
          {/* end .reviewFormContainer */}
        </div>
      </div>
    </div>
  );
};
