/**
 * CitySelectionScreen component
 * Third step of registration: "Ваш город"
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '../../../components/ProfileHeader';
import { CityNotFoundModal } from '../../../components/CityNotFoundModal';
import styles from './CitySelectionScreen.module.css';
import type { CitySelectionScreenProps, City } from './CitySelectionScreen.types';

// Default cities available at start
const DEFAULT_CITIES: City[] = [
  { id: 'msk', name: 'Москва', countryId: 'ru', isActive: true },
  { id: 'spb', name: 'Санкт-Петербург', countryId: 'ru', isActive: true },
];

export const CitySelectionScreen: React.FC<CitySelectionScreenProps> = ({
  onNext,
  onBack,
  initialCityId,
}) => {
  const { t } = useTranslation();
  const [selectedCityId, setSelectedCityId] = useState<string | null>(initialCityId || null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TODO: Fetch cities from API when backend is ready
  // For now, use default cities
  const availableCities = DEFAULT_CITIES.filter((city) => city.isActive);

  const handleCitySelect = useCallback((cityId: string) => {
    setSelectedCityId(cityId);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedCityId) {
      onNext(selectedCityId);
    }
  }, [selectedCityId, onNext]);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const isButtonEnabled = selectedCityId !== null;

  return (
    <div className={styles.container}>
      <ProfileHeader
        showBackButton
        title={t('registration.header.title')}
        currentStep={3}
        totalSteps={9}
        onBack={onBack}
      />

      <div className={styles.content}>
        <h2 className={styles.title}>{t('registration.citySelection.title')}</h2>

        <div className={styles.citiesContainer}>
          {availableCities.map((city) => (
            <button
              key={city.id}
              className={`${styles.cityButton} ${
                selectedCityId === city.id ? styles.cityButtonSelected : ''
              }`}
              onClick={() => handleCitySelect(city.id)}
              type="button"
            >
              {city.name}
            </button>
          ))}
        </div>

        <button className={styles.helpLink} onClick={handleOpenModal} type="button">
          {t('registration.citySelection.helpLink')}
        </button>

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

      <CityNotFoundModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};
