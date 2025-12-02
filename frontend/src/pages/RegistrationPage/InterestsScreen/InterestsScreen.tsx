/**
 * InterestsScreen component
 * Sixth step of registration: "Ваши интересы"
 */

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '../../../components/ProfileHeader';
import { InterestTag } from '../../../components/InterestTag';
import { INTERESTS_DATA } from './interestsData';
import styles from './InterestsScreen.module.css';
import type { InterestsScreenProps } from './InterestsScreen.types';

const MAX_INTERESTS = 10;

export const InterestsScreen: React.FC<InterestsScreenProps> = ({
  onNext,
  onSkip,
  onBack,
  initialInterests = [],
}) => {
  const { t } = useTranslation();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialInterests);

  const hasSelection = useMemo(() => selectedInterests.length > 0, [selectedInterests]);

  const canSelectMore = useMemo(
    () => selectedInterests.length < MAX_INTERESTS,
    [selectedInterests.length]
  );

  const handleToggleInterest = useCallback(
    (interestId: string) => {
      setSelectedInterests((prev) => {
        const isSelected = prev.includes(interestId);

        if (isSelected) {
          // Remove from selection
          return prev.filter((id) => id !== interestId);
        } else {
          // Add to selection if limit not reached
          if (prev.length < MAX_INTERESTS) {
            return [...prev, interestId];
          }
          // TODO: Show toast notification about limit
          return prev;
        }
      });
    },
    []
  );

  const handleNext = useCallback(() => {
    onNext(selectedInterests);
  }, [selectedInterests, onNext]);

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <ProfileHeader
          showBackButton
          title={t('registration.header.title')}
          currentStep={6}
          totalSteps={9}
          onBack={onBack}
        />
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{t('registration.interests.title')}</h2>
        <p className={styles.subtitle}>{t('registration.interests.subtitle')}</p>

        <div className={styles.interestsGrid}>
          {INTERESTS_DATA.map((interest) => {
            const isSelected = selectedInterests.includes(interest.id);
            const isDisabled = !isSelected && !canSelectMore;

            return (
              <InterestTag
                key={interest.id}
                interest={interest}
                selected={isSelected}
                onClick={() => handleToggleInterest(interest.id)}
                disabled={isDisabled}
              />
            );
          })}
        </div>
      </div>

      <div className={styles.bottomButtonContainer}>
        {hasSelection ? (
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={handleNext}
            type="button"
          >
            {t('common.next')}
          </button>
        ) : (
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={handleSkip}
            type="button"
          >
            {t('registration.interests.skip')}
          </button>
        )}
      </div>
    </div>
  );
};



