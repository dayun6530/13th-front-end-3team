// src/pages/Home/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import homeImage from "../../assets/images/home_img.jpg";
import styles from "./Home.module.css";
export const HomePage = () => {
  return (
    <div className={styles.homePageContainer}>
      <div className={styles.mainWrapper}>
        <div className={styles.contentArea}>
          <div className={styles.headerWrapper}>
            <div className={styles.logoContainer}>
              <div className={styles.logoTextWrapper}>
                <div className={styles.logoText}>Charge Buddy</div>
              </div>
            </div>
          </div>

          <div className={styles.heroSection}>
            <div className={styles.heroContent}>
              <div className={styles.imageContainer}>
                <img
                  className={styles.mainImage}
                  alt="Main Background"
                  src={homeImage}
                />
              </div>

              {/* '차량 정보 등록하기' 버튼 부분 수정 */}
              <Link
                to="/register-vehicle"
                className={styles.registerVehicleLink}
              >
                {" "}
                <div className={styles.registerButton}>
                  <div className={styles.buttonTextWrapper}>
                    <div className={styles.buttonText}>차량 정보 등록하기</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
