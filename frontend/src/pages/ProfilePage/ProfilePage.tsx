/**
 * ProfilePage component
 * Main profile page with view, edit, and settings modes
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ProfileView } from './components/ProfileView';
import { ProfileEdit } from './components/ProfileEdit';
import { SettingsScreen } from './components/SettingsScreen';
import { DeleteAccountModal } from './components/DeleteAccountModal';
import { BottomNav } from '../HomePage/components';
import { api } from '../../api/client';
import type { UserProfile, ProfileMode } from './ProfilePage.types';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<ProfileMode>('view');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch profile from API
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if Telegram WebApp is available
      if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
        console.warn('Telegram WebApp not available');
        setIsLoading(false);
        return;
      }

      const response = await api.get<{ profile: UserProfile }>('/api/v1/user/profile', {
        requireAuth: true,
      });

      if (response.success && response.data) {
        setProfile(response.data.profile);
      } else {
        console.error('Failed to fetch profile:', response.error);
        
        // Handle 401 - redirect to registration or show message
        if (response.error?.code === 'UNAUTHORIZED') {
          console.log('User not authenticated, redirecting to registration');
          // Optionally redirect to registration
          // navigate('/registration');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEdit = useCallback(() => {
    setMode('edit');
  }, []);

  const handleSettings = useCallback(() => {
    setMode('settings');
  }, []);

  const handleBack = useCallback(() => {
    setMode('view');
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      // TODO: Implement logout
      console.log('Logout');
      // Clear auth and redirect
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, []);

  const handleSaveProfile = useCallback(
    async (updatedProfile: Partial<UserProfile>) => {
      try {
        const response = await api.patch('/api/v1/user/profile', updatedProfile, {
          requireAuth: true,
        });

        if (response.success) {
          await fetchProfile();
          setMode('view');
        } else {
          console.error('Failed to update profile:', response.error);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    },
    [fetchProfile]
  );

  const handleDeleteAccount = useCallback(async () => {
    try {
      const response = await api.delete('/api/v1/user/account', {
        requireAuth: true,
      });

      if (response.success) {
        // Redirect to home or login
        navigate('/');
      } else {
        console.error('Failed to delete account:', response.error);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setShowDeleteModal(false);
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>{t('common.loading')}</div>
      </div>
    );
  }

  if (!profile) {
    // Check if it's an auth error
    const isAuthError = typeof window !== 'undefined' && 
      (!window.Telegram?.WebApp || !window.Telegram.WebApp.initData);
    
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {isAuthError 
            ? t('errors.authenticationRequired') || 'Требуется авторизация. Пожалуйста, откройте приложение через Telegram.'
            : t('errors.somethingWentWrong')}
        </div>
        {isAuthError && (
          <button 
            onClick={() => navigate('/registration')}
            className={styles.retryButton}
          >
            {t('common.goToRegistration') || 'Перейти к регистрации'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {mode === 'view' && (
        <ProfileView
          profile={profile}
          onEdit={handleEdit}
          onSettings={handleSettings}
          onLogout={handleLogout}
        />
      )}

      {mode === 'edit' && (
        <ProfileEdit profile={profile} onSave={handleSaveProfile} onBack={handleBack} />
      )}

      {mode === 'settings' && (
        <SettingsScreen
          profile={profile}
          onBack={handleBack}
          onDeleteAccount={() => setShowDeleteModal(true)}
          onUpdateSettings={handleSaveProfile}
        />
      )}

      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {mode === 'view' && <BottomNav activeTab="profile" />}
    </div>
  );
}

