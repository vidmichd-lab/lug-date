/**
 * Types for ProfileEdit component
 */

import type { UserProfile } from '../../ProfilePage.types';

export interface ProfileEditProps {
  profile: UserProfile;
  onSave: (profile: Partial<UserProfile>) => void;
  onBack: () => void;
}



