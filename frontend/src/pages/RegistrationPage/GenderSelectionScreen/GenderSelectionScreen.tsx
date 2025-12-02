/**
 * GenderSelectionScreen component
 * Fourth step of registration: "Ваш гендер"
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '../../../components/ProfileHeader';
import type { Gender } from '../../../stores/registrationStore';
import styles from './GenderSelectionScreen.module.css';
import type { GenderSelectionScreenProps, GenderOption } from './GenderSelectionScreen.types';

const GENDER_OPTIONS: GenderOption[] = [
  { id: 'female', label: 'Женский' },
  { id: 'male', label: 'Мужской' },
  { id: 'prefer-not-to-say', label: 'Не хочу указывать' },
];

export const GenderSelectionScreen: React.FC<GenderSelectionScreenProps> = ({
  onNext,
  onBack,
  initialGender,
}) => {
  const { t } = useTranslation();
  const [selectedGender, setSelectedGender] = useState<Gender | null>(initialGender || null);

  const handleGenderSelect = useCallback((genderId: Gender) => {
    setSelectedGender(genderId);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedGender) {
      onNext(selectedGender);
    }
  }, [selectedGender, onNext]);

  const isButtonEnabled = selectedGender !== null;

  return (
    <div className={styles.container}>
      <ProfileHeader
        showBackButton
        title={t('registration.header.title')}
        currentStep={4}
        totalSteps={9}
        onBack={onBack}
      />

      <div className={styles.content}>
        <h2 className={styles.title}>{t('registration.genderSelection.title')}</h2>

        <div className={styles.genderOptions}>
          {GENDER_OPTIONS.map((option) => (
            <button
              key={option.id}
              className={`${styles.genderButton} ${
                selectedGender === option.id ? styles.genderButtonSelected : ''
              }`}
              onClick={() => handleGenderSelect(option.id)}
              type="button"
              role="radio"
              aria-checked={selectedGender === option.id}
              aria-label={t(`registration.genderSelection.options.${option.id}`)}
            >
              {t(`registration.genderSelection.options.${option.id}`)}
            </button>
          ))}
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



