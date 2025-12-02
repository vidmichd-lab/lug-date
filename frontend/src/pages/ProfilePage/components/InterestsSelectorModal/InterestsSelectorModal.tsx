/**
 * InterestsSelectorModal component
 * Modal for selecting interests
 */

import { FC, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { INTERESTS_DATA } from '../../../RegistrationPage/InterestsScreen/interestsData';
import { InterestTag } from '../../../../components/InterestTag';
import styles from './InterestsSelectorModal.module.css';
import type { InterestsSelectorModalProps } from './InterestsSelectorModal.types';

const MAX_INTERESTS = 10;

export const InterestsSelectorModal: FC<InterestsSelectorModalProps> = ({
  isOpen,
  selectedInterests,
  onSelect,
  onClose,
}) => {
  const { t } = useTranslation();
  const [localSelected, setLocalSelected] = useState<string[]>(selectedInterests);

  useEffect(() => {
    setLocalSelected(selectedInterests);
  }, [selectedInterests, isOpen]);

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

  const handleToggleInterest = useCallback(
    (interestId: string) => {
      setLocalSelected((prev) => {
        const isSelected = prev.includes(interestId);
        if (isSelected) {
          return prev.filter((id) => id !== interestId);
        } else {
          if (prev.length < MAX_INTERESTS) {
            return [...prev, interestId];
          }
          return prev;
        }
      });
    },
    []
  );

  const handleSave = useCallback(() => {
    onSelect(localSelected);
    onClose();
  }, [localSelected, onSelect, onClose]);

  if (!isOpen) return null;

  const canSelectMore = localSelected.length < MAX_INTERESTS;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.interestsSelectorModal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{t('settings.selectInterests')}</h3>

        <div className={styles.interestsGrid}>
          {INTERESTS_DATA.map((interest) => {
            const isSelected = localSelected.includes(interest.id);
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

        <div className={styles.modalFooter}>
          <p className={styles.selectedCount}>
            {localSelected.length} / {MAX_INTERESTS} {t('profile.interestsSelected')}
          </p>
          <div className={styles.modalButtons}>
            <button className={styles.cancelButton} onClick={onClose} type="button">
              {t('common.cancel')}
            </button>
            <button className={styles.saveButton} onClick={handleSave} type="button">
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



