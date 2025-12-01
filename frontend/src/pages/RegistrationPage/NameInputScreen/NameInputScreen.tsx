/**
 * NameInputScreen component
 * First step of registration: "Как вас зовут?"
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '../../../components/ProfileHeader';
import styles from './NameInputScreen.module.css';
import type { NameInputScreenProps, NameValidationError } from './NameInputScreen.types';

const MAX_LENGTH = 24;
const MIN_LENGTH = 2;

// Validation functions
const validateName = (value: string): NameValidationError => {
  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue.length === 0) {
    return 'empty';
  }

  if (trimmedValue.length < MIN_LENGTH) {
    return 'empty';
  }

  if (trimmedValue.length > MAX_LENGTH) {
    return 'tooLong';
  }

  // Check if contains only letters (including Cyrillic, Latin, and spaces)
  const lettersOnlyRegex = /^[a-zA-Zа-яА-ЯёЁ\s]+$/;
  if (!lettersOnlyRegex.test(trimmedValue)) {
    return 'invalidChars';
  }

  return null;
};

export const NameInputScreen: React.FC<NameInputScreenProps> = ({
  onNext,
  onBack,
  initialValue = '',
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState<NameValidationError>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Validate on change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Auto-capitalize first letter when we have at least 2 characters
    if (value.length >= MIN_LENGTH) {
      // Split by spaces and capitalize each word
      const words = value.split(' ');
      const capitalizedWords = words.map((word, index) => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });
      value = capitalizedWords.join(' ');
    }

    // Limit to max length
    if (value.length > MAX_LENGTH) {
      value = value.slice(0, MAX_LENGTH);
    }

    setName(value);
    const validationError = validateName(value);
    setError(validationError);
  }, []);

  const handleNext = useCallback(() => {
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    onNext(name.trim());
  }, [name, onNext]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !error && name.trim().length >= MIN_LENGTH) {
        handleNext();
      }
    },
    [error, name, handleNext]
  );

  const isButtonEnabled = !error && name.trim().length >= MIN_LENGTH;

  return (
    <div className={styles.container}>
      <ProfileHeader
        showBackButton
        title={t('registration.header.title')}
        currentStep={1}
        totalSteps={9}
        onBack={onBack}
      />

      <div className={styles.content}>
        <h2 className={styles.title}>{t('registration.nameInput.title')}</h2>

        <div className={styles.inputContainer}>
          <input
            ref={inputRef}
            type="text"
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            placeholder={t('registration.nameInput.placeholder')}
            value={name}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            maxLength={MAX_LENGTH}
            autoComplete="given-name"
            autoCapitalize="words"
          />
          {error && (
            <p className={styles.errorMessage}>
              {t(`registration.nameInput.errors.${error}`)}
            </p>
          )}
        </div>

        <div className={styles.buttonContainer}>
          <button
            className={styles.button}
            onClick={handleNext}
            disabled={!isButtonEnabled}
            type="button"
          >
            {t('common.next')}
          </button>
        </div>
      </div>
    </div>
  );
};

