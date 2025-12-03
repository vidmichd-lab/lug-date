/**
 * DateOfBirthScreen component
 * Second step of registration: "Дата рождения"
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '../../../components/ProfileHeader';
import { Viewswitch } from '../../../design-system/components/viewswitch';
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
  const [_error, setError] = useState<DateValidationError>(null);

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

  // Special layout for under-age error
  if (isUnderAge) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>{t('registration.dateOfBirth.title')}</h2>

          <div className={styles.errorContainer}>
            <div className={styles.dateInputContainer}>
              <input
                ref={dayRef}
                type="text"
                inputMode="numeric"
                className={`${styles.dateInput} ${styles.dateInputDay} ${styles.dateInputError}`}
                placeholder="31"
                value={day}
                onChange={handleDayChange}
                maxLength={2}
              />
              <input
                ref={monthRef}
                type="text"
                inputMode="numeric"
                className={`${styles.dateInput} ${styles.dateInputMonth} ${styles.dateInputError}`}
                placeholder="01"
                value={month}
                onChange={handleMonthChange}
                maxLength={2}
              />
              <input
                ref={yearRef}
                type="text"
                inputMode="numeric"
                className={`${styles.dateInput} ${styles.dateInputYear} ${styles.dateInputError}`}
                placeholder="2009"
                value={year}
                onChange={handleYearChange}
                maxLength={4}
              />
            </div>
            <p className={styles.errorMessage}>{t('registration.dateOfBirth.errors.underAge')}</p>
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <button
            className={`${styles.button} ${styles.buttonActive}`}
            onClick={handleExit}
            type="button"
          >
            {t('registration.dateOfBirth.exit')}
          </button>
        </div>
      </div>
    );
  }

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
            className={`${styles.dateInput} ${styles.dateInputDay}`}
            placeholder="31"
            value={day}
            onChange={handleDayChange}
            maxLength={2}
          />
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            className={`${styles.dateInput} ${styles.dateInputMonth}`}
            placeholder="01"
            value={month}
            onChange={handleMonthChange}
            maxLength={2}
          />
          <input
            ref={yearRef}
            type="text"
            inputMode="numeric"
            className={`${styles.dateInput} ${styles.dateInputYear}`}
            placeholder="2000"
            value={year}
            onChange={handleYearChange}
            maxLength={4}
          />
        </div>
      </div>

      {isButtonEnabled && (
        <div className={styles.switchContainer}>
          <div className={styles.switchWrapper}>
            <span className={styles.switchLabel}>{t('registration.dateOfBirth.showAge')}</span>
            <Viewswitch
              className={styles.switch}
              property1={showAge ? 'Default' : 'Variant4'}
              onClick={() => setShowAge(!showAge)}
            />
          </div>
          <div className={styles.buttonContainer}>
            <button
              className={`${styles.button} ${styles.buttonActive}`}
              onClick={handleNext}
              type="button"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      )}

      {!isButtonEnabled && (
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={handleNext} disabled type="button">
            {t('common.next')}
          </button>
        </div>
      )}
    </div>
  );
};
