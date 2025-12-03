/**
 * CityNotFoundModal component
 * Modal for explaining why a city is not available
 */

import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CityNotFoundModal.module.css';
import type { CityNotFoundModalProps } from './CityNotFoundModal.types';

export const CityNotFoundModal: FC<CityNotFoundModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number | null>(null);

  // Block body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startY !== null) {
      const deltaY = e.touches[0].clientY - startY;
      if (deltaY > 0) {
        setCurrentY(deltaY);
      }
    }
  };

  const handleTouchEnd = () => {
    if (currentY !== null && currentY > 100) {
      onClose();
    }
    setStartY(null);
    setCurrentY(null);
  };

  return (
    <>
      <div className={styles.backdrop} onClick={handleBackdropClick} />
      <div
        className={styles.modal}
        onClick={handleModalClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: currentY !== null ? `translateY(${currentY}px)` : undefined,
        }}
      >
        <div className={styles.modalContent}>
          <h2 className={styles.title}>{t('registration.citySelection.modal.title')}</h2>
          <p className={styles.description}>{t('registration.citySelection.modal.description')}</p>
          <div className={styles.buttonContainer}>
            <button className={styles.button} onClick={onClose} type="button">
              {t('registration.citySelection.modal.okay')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
