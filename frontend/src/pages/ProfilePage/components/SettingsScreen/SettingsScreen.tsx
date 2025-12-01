/**
 * SettingsScreen component
 * Settings screen for user profile
 */

import { useState, useCallback, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Toggle } from '../Toggle';
import { CitySelectorModal } from '../CitySelectorModal';
import { DeleteAccountModal } from '../DeleteAccountModal';
import styles from './SettingsScreen.module.css';
import type { SettingsScreenProps } from './SettingsScreen.types';

const DEFAULT_CITIES = [
  { id: 'msk', name: 'Москва' },
  { id: 'spb', name: 'Санкт-Петербург' },
];

export const SettingsScreen: FC<SettingsScreenProps> = ({
  profile,
  onBack,
  onDeleteAccount,
  onUpdateSettings,
}) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(profile.settings);
  const [city, setCity] = useState(profile.city);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);

  const handleToggle = useCallback(
    (key: keyof typeof settings, value: boolean) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      onUpdateSettings({ settings: newSettings });
    },
    [settings, onUpdateSettings]
  );

  const handleCityChange = useCallback(
    (cityId: string) => {
      setCity(cityId);
      onUpdateSettings({ city: cityId });
    },
    [onUpdateSettings]
  );

  const selectedCity = DEFAULT_CITIES.find((c) => c.id === city) || DEFAULT_CITIES[0];

  return (
    <div className={styles.container}>
      <div className={styles.settingsHeader}>
        <button className={styles.backButton} onClick={onBack} type="button" aria-label={t('common.back')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h2 className={styles.settingsTitle}>{t('settings.title')}</h2>
        <div style={{ width: '40px' }} />
      </div>

      <div className={styles.content}>
        {/* Main Account */}
        <div className={styles.settingsSection}>
          <h3 className={styles.sectionTitle}>{t('settings.mainAccount')}</h3>
          <div className={styles.settingsRow}>
            <Toggle
              checked={settings.isOnline}
              onChange={(checked) => handleToggle('isOnline', checked)}
              label={t('settings.online')}
            />
          </div>
        </div>

        {/* City */}
        <div className={styles.settingsSection}>
          <button
            className={styles.settingsFieldSelect}
            onClick={() => setShowCityModal(true)}
            type="button"
          >
            <span className={styles.settingsLabel}>{t('settings.city')}</span>
            <div className={styles.fieldValueContainer}>
              <span className={styles.fieldValue}>{selectedCity.name}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.changeIcon}
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Privacy */}
        <div className={styles.settingsSection}>
          <h3 className={styles.sectionTitle}>{t('settings.privacy')}</h3>
          <div className={styles.settingsRow}>
            <Toggle
              checked={settings.showMeetingCounter}
              onChange={(checked) => handleToggle('showMeetingCounter', checked)}
              label={t('settings.showMeetingCounter')}
            />
          </div>
          <div className={styles.settingsRow}>
            <Toggle
              checked={settings.showAge}
              onChange={(checked) => handleToggle('showAge', checked)}
              label={t('settings.showAge')}
            />
          </div>
          <div className={styles.settingsRow}>
            <Toggle
              checked={settings.notifyAboutMatches}
              onChange={(checked) => handleToggle('notifyAboutMatches', checked)}
              label={t('settings.aboutMatches')}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className={styles.settingsSection}>
          <h3 className={styles.sectionTitle}>{t('settings.notifications')}</h3>
          <div className={styles.settingsRow}>
            <Toggle
              checked={settings.notifyAboutUpdates}
              onChange={(checked) => handleToggle('notifyAboutUpdates', checked)}
              label={t('settings.aboutUpdates')}
            />
          </div>
        </div>

        {/* Documents */}
        <div className={styles.settingsSection}>
          <h3 className={styles.sectionTitle}>{t('settings.documents')}</h3>
          <button className={styles.documentLink} type="button">
            <span className={styles.documentText}>{t('settings.userAgreement')}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.chevronIcon}
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
          <button className={styles.documentLink} type="button">
            <span className={styles.documentText}>{t('settings.privacyPolicy')}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.chevronIcon}
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

        {/* Danger Zone */}
        <div className={styles.settingsSection}>
          <h3 className={styles.sectionTitle}>{t('settings.dangerZone')}</h3>
          <div className={styles.supportContainer}>
            <button
              className={styles.supportButton}
              onClick={() => setShowSupportPopup(!showSupportPopup)}
              type="button"
            >
              <span className={styles.supportText}>{t('settings.support')}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.supportIcon}
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
            </button>

            {showSupportPopup && (
              <div className={styles.supportPopup}>
                <p className={styles.supportPopupText}>{t('settings.supportText')}</p>
                <button
                  className={styles.deleteProfileLink}
                  onClick={() => {
                    setShowSupportPopup(false);
                    setShowDeleteModal(true);
                  }}
                  type="button"
                >
                  {t('settings.deleteProfile')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <CitySelectorModal
        isOpen={showCityModal}
        selectedCityId={city}
        cities={DEFAULT_CITIES}
        onSelect={handleCityChange}
        onClose={() => setShowCityModal(false)}
      />

      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={onDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};
