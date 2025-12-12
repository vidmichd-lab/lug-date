/**
 * ProfileEdit component
 * Edit mode for user profile
 */

import { useState, useCallback, useRef, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { InputWithIcon } from '../../../../components/InputWithIcon';
import { INTERESTS_DATA } from '../../../RegistrationPage/InterestsScreen/interestsData';
import { CitySelectorModal } from '../CitySelectorModal';
import { InterestsSelectorModal } from '../InterestsSelectorModal';
import { validateDateOfBirth } from '../../../RegistrationPage/DateOfBirthScreen/utils';
import { api } from '../../../../api/client';
import styles from './ProfileEdit.module.css';
import type { ProfileEditProps } from './ProfileEdit.types';
import type { Goal, Gender } from '../../ProfilePage.types';

const GOAL_OPTIONS = [
  { id: 'find-friends' as Goal, label: 'Найти друзей' },
  { id: 'networking' as Goal, label: 'Нетворкинг' },
  { id: 'dating' as Goal, label: 'Познакомиться' },
  { id: 'serious-relationship' as Goal, label: 'Серьезные отношения' },
  { id: 'other' as Goal, label: 'Другой' },
];

const GENDER_OPTIONS = [
  { id: 'male' as Gender, label: 'Мужской' },
  { id: 'female' as Gender, label: 'Женский' },
  { id: 'prefer-not-to-say' as Gender, label: 'Не хочу указывать' },
];

const DEFAULT_CITIES = [
  { id: 'msk', name: 'Москва' },
  { id: 'spb', name: 'Санкт-Петербург' },
];

export const ProfileEdit: FC<ProfileEditProps> = ({ profile, onSave, onBack }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    goal: profile.goal,
    bio: profile.bio || '',
    job: profile.job || '',
    company: profile.company || '',
    interests: [...(profile.interests || [])],
    city: profile.city,
    gender: profile.gender,
    birthDate: profile.birthDate
      ? {
          day: String(profile.birthDate.day).padStart(2, '0'),
          month: String(profile.birthDate.month).padStart(2, '0'),
          year: String(profile.birthDate.year),
        }
      : {
          day: '',
          month: '',
          year: '',
        },
  });
  const [photoUrl, setPhotoUrl] = useState(profile.photo);
  const [isUploading, setIsUploading] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  // Get selected interests with their data
  const selectedInterests = INTERESTS_DATA.filter((interest) =>
    formData.interests.includes(interest.id)
  );

  const handlePhotoUpdate = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || '';
      if (!userId) throw new Error('User ID not available');

      const response = await api.upload<{
        photoUrls: { medium: { webp?: string; jpeg?: string } };
      }>('/api/v1/photos', file, { userId }, { requireAuth: true });

      if (response.success && response.data?.photoUrls) {
        const displayUrl =
          response.data.photoUrls.medium.webp || response.data.photoUrls.medium.jpeg;
        if (displayUrl) setPhotoUrl(displayUrl);
      }
    } catch (error) {
      console.error('Failed to upload photo:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleDateChange = useCallback((field: 'day' | 'month' | 'year', value: string) => {
    const numValue = value.replace(/\D/g, '');
    setFormData((prev) => ({
      ...prev,
      birthDate: { ...prev.birthDate, [field]: numValue },
    }));

    // Auto-focus
    if (field === 'day' && numValue.length === 2) monthRef.current?.focus();
    if (field === 'month' && numValue.length === 2) yearRef.current?.focus();
  }, []);

  // Validate date
  useEffect(() => {
    const { day, month, year } = formData.birthDate;
    const dayStr = String(day || '');
    const monthStr = String(month || '');
    const yearStr = String(year || '');
    if (
      dayStr &&
      monthStr &&
      yearStr &&
      dayStr.length === 2 &&
      monthStr.length === 2 &&
      yearStr.length === 4
    ) {
      const validation = validateDateOfBirth(dayStr, monthStr, yearStr);
      setDateError(
        validation.error ? t(`registration.dateOfBirth.errors.${validation.error}`) : null
      );
    } else {
      setDateError(null);
    }
  }, [formData.birthDate, t]);

  const handleSave = useCallback(async () => {
    if (dateError) return;

    const updatedProfile = {
      goal: formData.goal,
      bio: formData.bio,
      job: formData.job,
      company: formData.company,
      interests: formData.interests,
      city: formData.city,
      gender: formData.gender,
      birthDate: {
        day: parseInt(String(formData.birthDate.day), 10),
        month: parseInt(String(formData.birthDate.month), 10),
        year: parseInt(String(formData.birthDate.year), 10),
      },
      photo: photoUrl,
    };

    onSave(updatedProfile);
  }, [formData, photoUrl, dateError, onSave]);

  const selectedCity = DEFAULT_CITIES.find((c) => c.id === formData.city) || DEFAULT_CITIES[0];

  return (
    <div className={styles.container}>
      <div className={styles.editProfileHeader}>
        <button
          className={styles.backButton}
          onClick={onBack}
          type="button"
          aria-label={t('common.back')}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h2 className={styles.editProfileTitle}>{t('profile.editTitle')}</h2>
        <div style={{ width: '40px' }} />
      </div>

      <div className={styles.content}>
        {/* Photo Section */}
        <div className={styles.photoSection}>
          <div className={styles.photoContainer}>
            <img src={photoUrl} alt={profile.name} className={styles.profilePhoto} />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpdate}
            aria-label={t('profile.updatePhoto')}
            style={{ display: 'none' }}
          />
          <button
            className={styles.updatePhotoButton}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            type="button"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V5C1 4.46957 1.21071 3.96086 1.58579 3.58579C1.96086 3.21071 2.46957 3 3 3H9L11 5H21C21.5304 5 22.0391 5.21071 22.4142 5.58579C22.7893 5.96086 23 6.46957 23 7V19Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{isUploading ? t('common.loading') : t('profile.updatePhoto')}</span>
          </button>
        </div>

        {/* Goal Selector */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('profile.aboutYou')}</h3>
          <div className={styles.goalSelector}>
            {GOAL_OPTIONS.map((option) => (
              <button
                key={option.id}
                className={`${styles.goalOption} ${
                  formData.goal === option.id ? styles.goalOptionSelected : ''
                }`}
                onClick={() => handleFieldChange('goal', option.id)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className={styles.section}>
          <InputWithIcon
            icon="edit"
            placeholder={t('profile.bioPlaceholder')}
            value={formData.bio}
            onChange={(value) => handleFieldChange('bio', value)}
            maxLength={200}
            type="textarea"
            rows={4}
          />
        </div>

        {/* Interests */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('profile.thoughts')}</h3>
          <div className={styles.interestsEdit}>
            {selectedInterests.map((interest) => (
              <div key={interest.id} className={styles.interestBadge}>
                <span className={styles.interestIcon} style={{ backgroundColor: interest.color }}>
                  <interest.iconComponent />
                </span>
                <span>{interest.label}</span>
              </div>
            ))}
            <button
              className={styles.addInterestButton}
              onClick={() => setShowInterestsModal(true)}
              type="button"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{t('profile.addInterest')}</span>
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('profile.additional')}</h3>
          <InputWithIcon
            icon="briefcase"
            placeholder={t('profile.jobPlaceholder')}
            value={formData.job}
            onChange={(value) => handleFieldChange('job', value)}
            maxLength={32}
            type="text"
          />
          <InputWithIcon
            icon="building"
            placeholder={t('profile.companyPlaceholder')}
            value={formData.company}
            onChange={(value) => handleFieldChange('company', value)}
            maxLength={32}
            type="text"
          />
        </div>

        {/* Date of Birth */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('profile.dateOfBirth')}</h3>
          <div className={styles.dateInputs}>
            <input
              ref={dayRef}
              type="text"
              inputMode="numeric"
              className={styles.dateInput}
              placeholder="31"
              value={formData.birthDate.day}
              onChange={(e) => handleDateChange('day', e.target.value)}
              maxLength={2}
            />
            <input
              ref={monthRef}
              type="text"
              inputMode="numeric"
              className={styles.dateInput}
              placeholder="01"
              value={formData.birthDate.month}
              onChange={(e) => handleDateChange('month', e.target.value)}
              maxLength={2}
            />
            <input
              ref={yearRef}
              type="text"
              inputMode="numeric"
              className={styles.dateInput}
              placeholder="2000"
              value={formData.birthDate.year}
              onChange={(e) => handleDateChange('year', e.target.value)}
              maxLength={4}
            />
          </div>
          {dateError && <p className={styles.dateError}>{dateError}</p>}
        </div>

        {/* Gender */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('profile.gender')}</h3>
          <div className={styles.genderOptions}>
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option.id}
                className={`${styles.genderOption} ${
                  formData.gender === option.id ? styles.genderOptionSelected : ''
                }`}
                onClick={() => handleFieldChange('gender', option.id)}
                type="button"
              >
                {t(`registration.genderSelection.options.${option.id}`)}
              </button>
            ))}
          </div>
        </div>

        {/* City */}
        <div className={styles.section}>
          <button
            className={styles.citySelectorButton}
            onClick={() => setShowCityModal(true)}
            type="button"
          >
            <span className={styles.cityLabel}>{t('settings.city')}</span>
            <span className={styles.cityValue}>{selectedCity.name}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Save Button */}
        <button
          className={styles.saveChangesButton}
          onClick={handleSave}
          disabled={!!dateError}
          type="button"
        >
          {t('profile.saveChanges')}
        </button>
      </div>

      <CitySelectorModal
        isOpen={showCityModal}
        selectedCityId={formData.city}
        cities={DEFAULT_CITIES}
        onSelect={(cityId) => handleFieldChange('city', cityId)}
        onClose={() => setShowCityModal(false)}
      />

      <InterestsSelectorModal
        isOpen={showInterestsModal}
        selectedInterests={formData.interests}
        onSelect={(interestIds) => handleFieldChange('interests', interestIds)}
        onClose={() => setShowInterestsModal(false)}
      />
    </div>
  );
};
