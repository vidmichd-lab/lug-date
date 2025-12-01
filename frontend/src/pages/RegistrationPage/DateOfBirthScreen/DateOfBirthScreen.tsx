/**
 * DateOfBirthScreen component
 * Second step of registration: "Дата рождения"
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '../../../components/ProfileHeader';
import { validateDateOfBirth } from './utils';
import styles from './DateOfBirthScreen.module.css';
import type { DateOfBirthScreenProps, DateValidationError } from './DateOfBirthScreen.types';


export const DateOfBirthScreen: React.FC<DateOfBirthScreenProps> = ({
  onNext,
  onBack,
  onExit,
  initialDate,
  initialShowAge = false,
}) => {
  const { t } = useTranslation();
  const [day, setDay] = useState(initialDate?.day || '');
  const [month, setMonth] = useState(initialDate?.month || '');
  const [year, setYear] = useState(initialDate?.year || '');
  const [showAge, setShowAge] = useState(initialShowAge);
  const [error, setError] = useState<DateValidationError>(null);

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    dayRef.current?.focus();
  }, []);

  // Validate when all fields are filled
  useEffect(() => {
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      const validation = validateDateOfBirth(day, month, year);
      setError(validation.error);
    } else {
      setError(null);
    }
  }, [day, month, year]);

  const handleDayChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Only numbers
    if (value.length > 2) value = value.slice(0, 2);
    setDay(value);

    // Auto-focus to month when 2 digits entered
    if (value.length === 2) {
      monthRef.current?.focus();
    }
  }, []);

  const handleMonthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Only numbers
    if (value.length > 2) value = value.slice(0, 2);
    setMonth(value);

    // Auto-focus to year when 2 digits entered
    if (value.length === 2) {
      yearRef.current?.focus();
    }
  }, []);

  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Only numbers
    if (value.length > 4) value = value.slice(0, 4);
    setYear(value);

    // Blur when 4 digits entered
    if (value.length === 4) {
      yearRef.current?.blur();
    }
  }, []);

  const handleNext = useCallback(() => {
    const validation = validateDateOfBirth(day, month, year);

    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    if (validation.error === 'under-age') {
      // Don't proceed, show error
      return;
    }

    onNext({ day, month, year }, showAge);
  }, [day, month, year, showAge, onNext]);

  const handleExit = useCallback(() => {
    onExit();
  }, [onExit]);

  const isAllFieldsFilled = day.length === 2 && month.length === 2 && year.length === 4;
  const validation = isAllFieldsFilled ? validateDateOfBirth(day, month, year) : null;
  const isButtonEnabled = validation?.isValid === true;
  const isUnderAge = validation?.error === 'under-age';

  return (
    <div className={styles.container}>
      <ProfileHeader
        showBackButton
        title={t('registration.header.title')}
        currentStep={2}
        totalSteps={9}
        onBack={onBack}
      />

      <div className={styles.content}>
        <h2 className={styles.title}>{t('registration.dateOfBirth.title')}</h2>

        <div className={styles.dateInputContainer}>
          <input
            ref={dayRef}
            type="text"
            inputMode="numeric"
            className={`${styles.dateInput} ${styles.dateInputDay} ${
              error ? styles.dateInputError : ''
            }`}
            placeholder="31"
            value={day}
            onChange={handleDayChange}
            maxLength={2}
          />
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            className={`${styles.dateInput} ${styles.dateInputMonth} ${
              error ? styles.dateInputError : ''
            }`}
            placeholder="01"
            value={month}
            onChange={handleMonthChange}
            maxLength={2}
          />
          <input
            ref={yearRef}
            type="text"
            inputMode="numeric"
            className={`${styles.dateInput} ${styles.dateInputYear} ${
              error ? styles.dateInputError : ''
            }`}
            placeholder="2000"
            value={year}
            onChange={handleYearChange}
            maxLength={4}
          />
        </div>

        {error === 'under-age' && (
          <div className={styles.errorBlock}>
            <p className={styles.errorMessage}>
              {t('registration.dateOfBirth.errors.underAge')}
            </p>
          </div>
        )}

        {isButtonEnabled && !isUnderAge && (
          <div className={styles.checkboxContainer}>
            <div
              className={`${styles.checkbox} ${showAge ? styles.checkboxChecked : ''}`}
              onClick={() => setShowAge(!showAge)}
            >
              {showAge && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 3L4.5 8.5L2 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <label
              htmlFor="showAge"
              className={styles.checkboxLabel}
              onClick={() => setShowAge(!showAge)}
            >
              <span>{t('registration.dateOfBirth.showAge')}</span>
              <svg
                className={styles.checkboxIcon}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Show tooltip with explanation
                }}
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 16V12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 8H12.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </label>
            <input
              type="checkbox"
              id="showAge"
              className={styles.checkboxInput}
              checked={showAge}
              onChange={(e) => setShowAge(e.target.checked)}
            />
          </div>
        )}

        <div className={styles.buttonContainer}>
          {isUnderAge ? (
            <button
              className={styles.button}
              onClick={handleExit}
              type="button"
            >
              {t('registration.dateOfBirth.exit')}
            </button>
          ) : (
            <button
              className={styles.button}
              onClick={handleNext}
              disabled={!isButtonEnabled}
              type="button"
            >
              {t('common.next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

