import React from "react";
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

// ✅ 로컬 이미지 파일을 직접 import
import mapIcon from "../../assets/icons/지도아이콘.png";
import reviewIcon from "../../assets/icons/리뷰아이콘.png";
import filterIcon from "../../assets/icons/필터아이콘.png";
import realtimeStatusImage from "../../assets/images/실시간 충전소 현황.png";
import userReviewImage from "../../assets/images/이용자가 직접 남긴 솔직한 후기.png";
import findChargerImage from "../../assets/images/나에게 꼭 맞는 충전소 찾기.png";

const HomePage = () => {
  return (
    <div className={styles.container}>
      {/* 1. 서비스 소개 섹션 */}
      <section className={styles.introSection}>
        <h1 className={styles.headline}>
          가장 빠르고 정확한 전기차 충전소 정보 <br />
          차지 버디와 함께하세요
        </h1>
        <p className={styles.subtext}>
          실시간 충전소 상태부터 이용자 리뷰, 주변 편의시설 정보까지 한 번에
          확인하세요.
        </p>
        <div className={styles.iconGroup}>
          <div className={styles.iconWrapper}>
            <img
              src={mapIcon}
              alt="지도 아이콘"
              className={styles.featureIcon}
            />
            <span>지도</span>
          </div>
          <div className={styles.iconWrapper}>
            <img
              src={reviewIcon}
              alt="리뷰 아이콘"
              className={styles.featureIcon}
            />
            <span>리뷰</span>
          </div>
          <div className={styles.iconWrapper}>
            <img
              src={filterIcon}
              alt="필터 아이콘"
              className={styles.featureIcon}
            />
            <span>필터</span>
          </div>
        </div>
      </section>

      {/* 2. 핵심 기능 강조 섹션 */}
      <section className={styles.featuresSection}>
        <div className={styles.featureCard}>
          <h2 className={styles.featureTitle}>실시간 충전소 현황</h2>
          <p className={styles.featureDescription}>
            지도에서 충전소의 사용 가능 여부를 실시간으로 확인하고, 시간 낭비
            없이 바로 충전하세요.
          </p>
          <img
            src={realtimeStatusImage}
            alt="실시간 지도 스크린샷"
            className={styles.featureImage}
          />
        </div>

        <div className={styles.featureCard}>
          <h2 className={styles.featureTitle}>
            이용자가 직접 남긴 <br />
            솔직한 후기
          </h2>
          <p className={styles.featureDescription}>
            방문자들의 생생한 리뷰를 통해 충전소의 상태와 편의시설 정보를 미리
            확인하세요.
          </p>
          <img
            src={userReviewImage}
            alt="리뷰 스크린샷"
            className={styles.featureImage}
          />
        </div>

        <div className={styles.featureCard}>
          <h2 className={styles.featureTitle}>
            나에게 꼭 맞는 <br />
            충전소 찾기
          </h2>
          <p className={styles.featureDescription}>
            충전 타입, 운영 시간, 주차 요금 등 다양한 필터로 원하는 충전소를
            쉽게 찾아보세요.
          </p>
          <img
            src={findChargerImage}
            alt="필터링 기능 스크린샷"
            className={styles.featureImage}
          />
        </div>
      </section>

      {/* 3. 행동 유도 (Call-to-Action) 섹션 */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaHeadline}>지금 바로 충전소를 찾아보세요</h2>
        <Link to="/map" className={styles.ctaButton}>
          지도로 이동하기
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
