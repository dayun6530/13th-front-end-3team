import React from "react";
import { Link } from "react-router-dom";
import styles from "./MyPage.module.css";

export const MyPage = () => {
  return (
    <div className={styles.myPageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          {/* Charge Buddy 로고 부분 */}
          <div className={styles.logoContainer}>
            <div className={styles.logoTextWrapper}>
              <div className={styles.logoText}>Charge Buddy</div>
            </div>
          </div>
          {/* 헤더에서 "홈" 링크와 다른 모든 요소 제거. 홈 링크는 아래로 이동 */}
        </div>

        <div className={styles.profileSectionWrapper}>
          <div className={styles.profileContentArea}>
            <div className={styles.profileHeaderWrapper}>
              <div className={styles.profileTitleContainer}>
                <div className={styles.profileTitle}>내 프로필</div>
              </div>
            </div>

            <div className={styles.summarySectionTitleWrapper}>
              <div className={styles.summarySectionTitle}>사용자 요약 정보</div>
            </div>

            <div className={styles.userInfoCard}>
              <div className={styles.profileImagePlaceholder} />

              <div className={styles.userInfoDetails}>
                <div className={styles.registrationDateWrapper}>
                  <div className={styles.registrationDateText}>
                    2025년 7월 31일 등록
                  </div>
                </div>
              </div>
              {/* "홈" 버튼을 userInfoCard 안으로 이동 및 새로운 컨테이너 추가 */}
              <div className={styles.homeButtonContainer}>
                <Link to="/map" className={styles.homeButtonText}>
                  홈
                </Link>
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statValueWrapper}>
                  <div className={styles.statValue}>0</div>
                </div>

                <div className={styles.statLabelContainer}>
                  <div className={styles.statLabelWrapper}>
                    <div className={styles.statLabel}>충전 횟수</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.summarySectionTitleWrapper}>
              <div className={styles.summarySectionTitle}>차량 정보</div>
            </div>

            <div className={styles.userInfoCard}>
              <div className={styles.userInfoDetails}>
                <div className={styles.vehicleNumberWrapper}>
                  <div className={styles.vehicleNumberText}>
                    차량 번호: 가-1234
                  </div>
                </div>

                <div className={styles.vehicleModelWrapper}>
                  <div className={styles.vehicleModelText}>
                    2022년, 테슬라 모델 Y
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.summarySectionTitleWrapper}>
              <div className={styles.summarySectionTitle}>최근 충전 이력</div>
            </div>

            <div className={styles.chargeHistoryItem}>
              <div className={styles.chargeDetails}>
                <div className={styles.chargeDateWrapper}>
                  <div className={styles.chargeDateText}>
                    날짜: 2024-07-26 14:00
                  </div>
                </div>

                <div className={styles.reviewStatusWrapper}>
                  <div className={styles.reviewStatusText}>리뷰: 미작성</div>
                </div>

                <div className={styles.chargeStationInfoWrapper}>
                  <p className={styles.chargeStationInfoText}>
                    충전소: 그린 에너지 충전소, 위치: 서울시 강남구 테헤란로 123
                  </p>
                </div>
              </div>

              <div className={styles.reviewActionButtonContainer}>
                <div className={styles.reviewActionButtonWrapper}>
                  <div className={styles.reviewButtonTextWrapper}>
                    <div className={styles.reviewButtonText}>리뷰 작성</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.chargeHistoryItem}>
              <div className={styles.chargeDetails}>
                <div className={styles.chargeDateWrapper}>
                  <div className={styles.chargeDateText}>
                    날짜: 2024-07-20 10:00
                  </div>
                </div>

                <div className={styles.reviewStatusWrapper}>
                  <div className={styles.reviewStatusText}>리뷰: 작성</div>
                </div>

                <div className={styles.chargeStationInfoWrapper}>
                  <p className={styles.chargeStationInfoText}>
                    충전소: 퀵 충전 스팟, 위치: 서울시 서초구 서초대로 456
                  </p>
                </div>
              </div>

              <div className={styles.reviewActionButtonContainer}>
                <div className={styles.reviewActionButtonWrapper}>
                  <div className={styles.reviewButtonTextWrapper}>
                    <div className={styles.reviewButtonText}>리뷰 보기</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.chargeHistoryItem}>
              <div className={styles.chargeDetails}>
                <div className={styles.chargeDateWrapper}>
                  <div className={styles.chargeDateText}>
                    날짜: 2024-07-15 16:00
                  </div>
                </div>

                <div className={styles.reviewStatusWrapper}>
                  <div className={styles.reviewStatusText}>리뷰: 미작성</div>
                </div>

                <div className={styles.chargeStationInfoWrapper}>
                  <p className={styles.chargeStationInfoText}>
                    충전소: 에코 충전 허브, 위치: 서울시 종로구 종로 789
                  </p>
                </div>
              </div>

              <div className={styles.reviewActionButtonContainer}>
                <div className={styles.reviewActionButtonWrapper}>
                  <div className={styles.reviewButtonTextWrapper}>
                    <div className={styles.reviewButtonText}>리뷰 작성</div>
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
