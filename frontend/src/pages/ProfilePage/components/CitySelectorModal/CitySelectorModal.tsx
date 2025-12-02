/**
 * CitySelectorModal component
 * Modal for selecting city
 */

import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CitySelectorModal.module.css';
import type { CitySelectorModalProps } from './CitySelectorModal.types';

export const CitySelectorModal: FC<CitySelectorModalProps> = ({
  isOpen,
  selectedCityId,
  cities,
  onSelect,
  onClose,
}) => {
  const { t } = useTranslation();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (cityId: string) => {
    onSelect(cityId);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.citySelectorModal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{t('settings.selectCity')}</h3>

        <div className={styles.citiesList}>
          {cities.map((city) => (
            <button
              key={city.id}
              className={`${styles.cityOption} ${
                selectedCityId === city.id ? styles.cityOptionSelected : ''
              }`}
              onClick={() => handleSelect(city.id)}
              type="button"
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};



