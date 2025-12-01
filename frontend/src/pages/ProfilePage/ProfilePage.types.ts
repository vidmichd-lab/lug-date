/**
 * Types for ProfilePage
 */

export type ProfileMode = 'view' | 'edit' | 'settings';

export type Gender = 'male' | 'female' | 'prefer-not-to-say';

export type Goal = 'find-friends' | 'networking' | 'dating' | 'serious-relationship' | 'other';

export interface BirthDate {
  day: string | number;
  month: string | number;
  year: string | number;
}

export interface ProfileSettings {
  isOnline: boolean;
  showMeetingCounter: boolean;
  showAge: boolean;
  notifyAboutMatches: boolean;
  notifyAboutUpdates: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  photo: string;
  goal: Goal;
  job?: string;
  company?: string;
  bio?: string;
  interests: string[];
  city: string;
  gender: Gender;
  birthDate: BirthDate;
  settings: ProfileSettings;
}

export interface ProfilePageProps {
  userId?: string;
  mode?: ProfileMode;
}

