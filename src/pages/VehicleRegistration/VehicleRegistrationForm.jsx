// src/pages/VehicleRegistration/VehicleRegistrationForm.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./VehicleRegistrationForm.module.css";

export const VehicleRegistrationForm = () => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    // 여기에 폼 데이터 저장 로직을 추가할 수 있습니다 (예: API 호출)
    console.log("정보 저장 버튼 클릭됨!");
    // 저장 로직 완료 후 마이페이지로 이동
    navigate("/mypage");
  };

  return (
    <div className={styles.container}>
      <div className={styles.layoutContainer}>
        {/* 기존 헤더 전체를 수정 */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {/* Charge Buddy 로고 SVG를 제거 */}
            <h2 className={styles.headerTitle}>ChargeBuddy</h2>
          </div>
          {/* 오른쪽 내비게이션, 알람 아이콘, 프로필 이미지 div를 제거 */}
        </header>

        <div className={styles.mainContentArea}>
          <div className={styles.contentContainer}>
            <div className={styles.pageTitleWrapper}>
              <p className={styles.pageTitle}>차량 정보 입력</p>
            </div>

            <h3 className={styles.sectionTitle}>차량 정보 등록</h3>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabelWrapper}>
                <p className={styles.inputLabel}>차량 번호</p>
                <input
                  placeholder="차량 번호를 입력하세요"
                  className={styles.formInput}
                  value=""
                />
              </label>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabelWrapper}>
                <p className={styles.inputLabel}>제조사</p>
                <select className={styles.formSelect}>
                  <option value="one">제조사를 선택하세요</option>
                  <option value="two">two</option>
                  <option value="three">three</option>
                </select>
              </label>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabelWrapper}>
                <p className={styles.inputLabel}>차종/모델명</p>
                <select className={styles.formSelect}>
                  <option value="one">모델명을 선택하세요</option>
                  <option value="two">two</option>
                  <option value="three">three</option>
                </select>
              </label>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabelWrapper}>
                <p className={styles.inputLabel}>연식</p>
                <select className={styles.formSelect}>
                  <option value="one">연식을 선택하세요</option>
                  <option value="two">two</option>
                  <option value="three">three</option>
                </select>
              </label>
            </div>

            <h3 className={styles.sectionTitle}>배터리 및 충전 규격 정보</h3>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabelWrapper}>
                <p className={styles.inputLabel}>배터리 용량 (kWh)</p>
                <input
                  placeholder="배터리 용량을 입력하세요"
                  className={styles.formInput}
                  value=""
                />
              </label>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabelWrapper}>
                <p className={styles.inputLabel}>충전 포트 타입</p>
                <select className={styles.formSelect}>
                  <option value="one">포트 타입을 선택하세요</option>
                  <option value="two">two</option>
                  <option value="three">three</option>
                </select>
              </label>
            </div>

            <h3 className={styles.sectionTitle}>충전 환경 설정</h3>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabelWrapper}>
                <p className={styles.inputLabel}>선호 충전 속도</p>
                <select className={styles.formSelect}>
                  <option value="one">속도를 선택하세요</option>
                  <option value="two">two</option>
                  <option value="three">three</option>
                </select>
              </label>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabelWrapper}>
                <p className={styles.inputLabel}>주로 이용하는 충전사업자</p>
                <select className={styles.formSelect}>
                  <option value="one">사업자를 선택하세요</option>
                  <option value="two">two</option>
                  <option value="three">three</option>
                </select>
              </label>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabelWrapper}>
                <p className={styles.inputLabel}>월 평균 주행 거리</p>
                <input
                  placeholder="거리를 입력하세요"
                  className={styles.formInput}
                  value=""
                />
              </label>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabelWrapper}>
                <p className={styles.inputLabel}>주 평균 충전 횟수</p>
                <input
                  placeholder="횟수를 입력하세요"
                  className={styles.formInput}
                  value=""
                />
              </label>
            </div>

            <h3 className={styles.sectionTitle}>사용자 맞춤설정</h3>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabelWrapper}>
                <p className={styles.inputLabel}>충전 목표 수준</p>
                <select className={styles.formSelect}>
                  <option value="one">수준을 선택하세요</option>
                  <option value="two">two</option>
                  <option value="three">three</option>
                </select>
              </label>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabelWrapper}>
                <p className={styles.inputLabel}>선호 충전 사업자</p>
                <select className={styles.formSelect}>
                  <option value="one">사업자를 선택하세요</option>
                  <option value="two">two</option>
                  <option value="three">three</option>
                </select>
              </label>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabelWrapper}>
                <p className={styles.inputLabel}>선호 상권 카테고리</p>
                <select className={styles.formSelect}>
                  <option value="one">카테고리를 선택하세요</option>
                  <option value="two">two</option>
                  <option value="three">three</option>
                </select>
              </label>
            </div>

            <div className={styles.submitButtonWrapper}>
              <button className={styles.submitButton} onClick={handleSubmit}>
                <span className={styles.submitButtonText}>정보 저장</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
