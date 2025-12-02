/**
 * Types for SettingsScreen component
 */

import type { UserProfile } from '../../ProfilePage.types';

export interface SettingsScreenProps {
  profile: UserProfile;
  onBack: () => void;
  onDeleteAccount: () => void;
  onUpdateSettings: (settings: Partial<UserProfile>) => void;
}



