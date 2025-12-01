/**
 * PhotoUploadScreen component
 * Eighth step of registration: "Последний штрих" - Photo upload
 */

import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '../../../components/ProfileHeader';
import { api } from '../../../api/client';
import styles from './PhotoUploadScreen.module.css';
import type { PhotoUploadScreenProps, PhotoUrls } from './PhotoUploadScreen.types';
import { cropImageToSquare, optimizeImage, validateImageFile, readFileAsDataURL } from './utils';

export const PhotoUploadScreen: React.FC<PhotoUploadScreenProps> = ({
  onNext,
  onBack,
  initialPhotoUrl,
}) => {
  const { t } = useTranslation();
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      // TODO: Show toast error
      console.error(validation.error);
      return;
    }

    setIsUploading(true);

    try {
      // Show preview immediately
      const preview = await readFileAsDataURL(file);
      setPreviewUrl(preview);

      // Crop to square
      const croppedBlob = await cropImageToSquare(file);

      // Optimize
      const optimizedBlob = await optimizeImage(croppedBlob);

      // Convert blob to File for upload
      const optimizedFile = new File([optimizedBlob], 'profile-photo.jpg', {
        type: 'image/jpeg',
      });

      // Get userId from Telegram WebApp
      const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || '';

      if (!userId) {
        throw new Error('User ID not available');
      }

      // Upload to server
      const response = await api.upload<{ photoUrls: PhotoUrls }>(
        '/api/v1/photos',
        optimizedFile,
        { userId },
        { requireAuth: true }
      );

      if (response.success && response.data?.photoUrls) {
        // Use medium size for display
        const displayUrl = response.data.photoUrls.medium.webp || response.data.photoUrls.medium.jpeg;
        setPhotoUrl(displayUrl);
        setPreviewUrl(null);
      } else {
        throw new Error(response.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload photo:', error);
      setPreviewUrl(null);
      // TODO: Show error toast
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUpdatePhoto = useCallback(() => {
    handleUploadClick();
  }, [handleUploadClick]);

  const handleNext = useCallback(() => {
    if (photoUrl) {
      onNext(photoUrl);
    }
  }, [photoUrl, onNext]);

  const displayUrl = previewUrl || photoUrl;

  return (
    <div className={styles.container}>
      <ProfileHeader
        showBackButton
        title={t('registration.header.title')}
        currentStep={8}
        totalSteps={9}
        onBack={onBack}
      />

      <div className={styles.content}>
        <h2 className={styles.title}>{t('registration.photoUpload.title')}</h2>
        <p className={styles.subtitle}>{t('registration.photoUpload.subtitle')}</p>

        <div className={`${styles.photoContainer} ${displayUrl ? styles.hasImage : ''}`}>
          {displayUrl ? (
            <img src={displayUrl} alt="Profile" className={styles.photoImage} />
          ) : (
            <svg
              className={styles.photoPlaceholderIcon}
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                fill="#BDBDBD"
              />
            </svg>
          )}

          {isUploading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner} />
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className={styles.hiddenInput}
          aria-label={t('registration.photoUpload.uploadButton')}
        />

        {!photoUrl ? (
          <button
            className={styles.uploadButton}
            onClick={handleUploadClick}
            disabled={isUploading}
            type="button"
          >
            {t('registration.photoUpload.uploadButton')}
          </button>
        ) : (
          <div className={styles.buttonGroup}>
            <button
              className={styles.refreshButton}
              onClick={handleUpdatePhoto}
              disabled={isUploading}
              type="button"
            >
              <svg
                className={styles.refreshIcon}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"
                  fill="currentColor"
                />
              </svg>
              {t('registration.photoUpload.updateButton')}
            </button>
            <button
              className={styles.nextButton}
              onClick={handleNext}
              disabled={isUploading}
              type="button"
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

