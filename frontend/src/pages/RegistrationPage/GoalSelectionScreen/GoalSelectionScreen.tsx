/**
 * GoalSelectionScreen component
 * Seventh step of registration: "Ваша цель"
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '../../../components/ProfileHeader';
import styles from './GoalSelectionScreen.module.css';
import type { GoalSelectionScreenProps, GoalOption, Goal } from './GoalSelectionScreen.types';

const GOAL_OPTIONS: GoalOption[] = [
  { id: 'find-friends', label: 'Найти друзей' },
  { id: 'networking', label: 'Нетворкинг' },
  { id: 'dating', label: 'Познакомиться' },
  { id: 'serious-relationship', label: 'Серьезные отношения' },
  { id: 'other', label: 'Другой' },
];

export const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({
  onNext,
  onBack,
  initialGoal,
}) => {
  const { t } = useTranslation();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(initialGoal || null);

  const handleGoalSelect = useCallback((goalId: Goal) => {
    setSelectedGoal(goalId);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedGoal) {
      onNext(selectedGoal);
    }
  }, [selectedGoal, onNext]);

  const isButtonEnabled = selectedGoal !== null;

  return (
    <div className={styles.container}>
      <ProfileHeader
        showBackButton
        title={t('registration.header.title')}
        currentStep={7}
        totalSteps={9}
        onBack={onBack}
      />

      <div className={styles.content}>
        <h2 className={styles.title}>{t('registration.goalSelection.title')}</h2>
        <p className={styles.subtitle}>{t('registration.goalSelection.subtitle')}</p>

        <div
          className={styles.goalsContainer}
          role="radiogroup"
          aria-label={t('registration.goalSelection.title')}
        >
          {GOAL_OPTIONS.map((option) => (
            <button
              key={option.id}
              className={`${styles.goalButton} ${
                selectedGoal === option.id ? styles.goalButtonSelected : ''
              }`}
              onClick={() => handleGoalSelect(option.id)}
              type="button"
              role="radio"
              aria-checked={selectedGoal === option.id}
              aria-label={t(`registration.goalSelection.options.${option.id}`)}
            >
              {t(`registration.goalSelection.options.${option.id}`)}
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
