// src/pages/Review/ReviewView.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./Review.module.css";

// 데모: 우리가 작성 페이지에서 사용한 키/정보
const DEFAULT_STATION_ID = "station-green-energy";
const FALLBACK = {
  stationName: "그린 에너지 충전소",
  stationAddr: "서울시 강남구 테헤란로 123",
};

export const ReviewViewPage = () => {
  const { stationId } = useParams();
  const key = `review:${stationId || DEFAULT_STATION_ID}`;
  const saved = localStorage.getItem(key);
  const review = saved ? JSON.parse(saved) : null;

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
                <div className={styles.sectionTitleWrapper}>
                  <div className={styles.sectionTitle}>리뷰가 없습니다</div>
                </div>
                <p className={styles.stationAddress}>
                  아직 작성된 리뷰가 없어요. 리뷰를 작성해 보세요.
                </p>
                <div className={styles.submitButtonSection}>
                  <Link to="/review" className={styles.submitReviewButton}>
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>
                        리뷰 작성하러 가기
                      </div>
                    </div>
                  </Link>
                </div>

                <div className={styles.submitButtonSection}>
                  <Link to="/mypage" className={styles.submitReviewButton}>
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>마이페이지로</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    stationName = FALLBACK.stationName,
    rating,
    recommend,
    text,
    photosCount,
    createdAt,
  } = review;

  const created = createdAt
    ? new Date(createdAt).toLocaleString()
    : "작성 시간 정보 없음";

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
                <div className={styles.stationName}>{stationName}</div>
              </div>
              <div className={styles.stationAddressSection}>
                <div className={styles.stationAddress}>
                  {FALLBACK.stationAddr}
                </div>
              </div>

              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>별점</div>
              </div>
              <div className={styles.starRatingSection}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={styles.starRatingButton}
                    style={
                      rating >= n
                        ? {
                            backgroundColor: "#00C2AD",
                            color: "#fff",
                            borderColor: "#00C2AD",
                          }
                        : undefined
                    }
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
                    className={styles.recommendButton}
                    style={
                      recommend === true
                        ? { outline: "2px solid #00C2AD", outlineOffset: 2 }
                        : undefined
                    }
                  >
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>추천</div>
                    </div>
                  </div>
                  <div
                    className={styles.disrecommendButton}
                    style={
                      recommend === false
                        ? { outline: "2px solid #00C2AD", outlineOffset: 2 }
                        : undefined
                    }
                  >
                    <div className={styles.buttonTextWrapper}>
                      <div className={styles.buttonText}>비추천</div>
                    </div>
                  </div>
                </div>
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
                    {text}
                  </div>
                </div>
              </div>

              <div className={styles.sectionTitleWrapper}>
                <div className={styles.sectionTitle}>사진</div>
              </div>
              <p className={styles.stationAddress}>
                {photosCount ? `첨부 ${photosCount}장` : "첨부된 사진 없음"}
              </p>

              <p className={styles.stationAddress}>작성일: {created}</p>

              <div
                className={styles.submitButtonSection}
                style={{ gap: 12, display: "flex", flexWrap: "wrap" }}
              >
                <Link to="/mypage" className={styles.submitReviewButton}>
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>마이페이지로</div>
                  </div>
                </Link>
                <Link to="/review" className={styles.submitReviewButton}>
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>리뷰 수정하기</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          {/* end .reviewFormContainer */}
        </div>
      </div>
    </div>
  );
};
