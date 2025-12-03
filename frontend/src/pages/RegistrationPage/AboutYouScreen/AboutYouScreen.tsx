/**
 * AboutYouScreen component
 * Fifth step of registration: "Расскажите о себе"
 */

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '../../../components/ProfileHeader';
import { InputWithIcon } from '../../../components/InputWithIcon';
import styles from './AboutYouScreen.module.css';
import type { AboutYouScreenProps, AboutYouFormData } from './AboutYouScreen.types';

export const AboutYouScreen: React.FC<AboutYouScreenProps> = ({
  onNext,
  onSkip,
  onBack,
  initialData,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<AboutYouFormData>({
    jobTitle: initialData?.jobTitle || '',
    company: initialData?.company || '',
    bio: initialData?.bio || '',
  });

  const hasContent = useMemo(() => {
    return (
      formData.jobTitle.trim() !== '' ||
      formData.company.trim() !== '' ||
      formData.bio.trim() !== ''
    );
  }, [formData]);

  const handleFieldChange = useCallback((field: keyof AboutYouFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleNext = useCallback(() => {
    onNext(formData);
  }, [formData, onNext]);

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  return (
    <div className={styles.container}>
      <ProfileHeader
        showBackButton
        title={t('registration.header.title')}
        currentStep={5}
        totalSteps={9}
        onBack={onBack}
      />

      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>{t('registration.aboutYou.title')}</h2>
          <p className={styles.subtitle}>{t('registration.aboutYou.subtitle')}</p>
        </div>

        <div className={styles.formFields}>
          <InputWithIcon
            icon="briefcase"
            placeholder={t('registration.aboutYou.jobTitle.placeholder')}
            value={formData.jobTitle}
            onChange={(value) => handleFieldChange('jobTitle', value)}
            maxLength={32}
            type="text"
          />

          <InputWithIcon
            icon="building"
            placeholder={t('registration.aboutYou.company.placeholder')}
            value={formData.company}
            onChange={(value) => handleFieldChange('company', value)}
            maxLength={32}
            type="text"
          />

          <InputWithIcon
            icon="edit"
            placeholder={t('registration.aboutYou.bio.placeholder')}
            value={formData.bio}
            onChange={(value) => handleFieldChange('bio', value)}
            maxLength={200}
            type="textarea"
            rows={4}
          />
        </div>

        <div className={styles.buttonContainer}>
          {hasContent ? (
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
              {t('registration.aboutYou.skip')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
