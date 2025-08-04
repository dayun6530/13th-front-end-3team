// src/pages/Review/Review.js
import React from "react";
// import depth3Frame1 from "../../assets/icons/depth-3-frame-1.svg"; // 경로 수정
import styles from "./Review.module.css"; // CSS Modules 임포트

export const ReviewPage = () => {
  // 컴포넌트 이름 변경
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

            {/* <img className={styles.headerIcon} alt="Depth frame" src={depth3Frame1} /> */}
          </div>

          <div className={styles.reviewFormContainer}>
            <div className={styles.reviewCard}>
              <div className={styles.stationNameSection}>
                <div className={styles.stationName}>그린 에너지 충전소</div>
              </div>

              <div className={styles.stationAddressSection}>
                <div className={styles.stationAddress}>
                  서울시 강남구 테헤란로 123
                </div>
              </div>

              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>별점</div>
              </div>

              <div className={styles.starRatingSection}>
                <div className={styles.starRatingButton}>
                  <div className={styles.starRatingValue}>1</div>
                </div>

                <div className={styles.starRatingButton}>
                  <div className={styles.starRatingValue}>2</div>
                </div>

                <div className={styles.starRatingButton}>
                  <div className={styles.starRatingValue}>3</div>
                </div>

                <div className={styles.starRatingButton}>
                  <div className={styles.starRatingValue}>4</div>
                </div>

                <div className={styles.starRatingButton}>
                  <div className={styles.starRatingValue}>5</div>
                </div>
              </div>

              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>추천 여부</div>
              </div>

              <div className={styles.recommendationSection}>
                <div className={styles.recommendationButtons}>
                  <div className={styles.recommendButton}>
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>추천</div>
                    </div>
                  </div>

                  <div className={styles.disrecommendButton}>
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
                  <div className={styles.reviewInputField} />
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
                    </div>
                  </div>

                  <div className={styles.addPhotoButton}>
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>사진 추가</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.submitButtonSection}>
                <div className={styles.submitReviewButton}>
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>리뷰 등록</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
