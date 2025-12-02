/**
 * Types for ProfileView component
 */

import type { UserProfile } from '../../ProfilePage.types';

export interface ProfileViewProps {
  profile: UserProfile;
  onEdit: () => void;
  onSettings: () => void;
  onLogout: () => void;
  onThreeDotMenu?: () => void;
}
