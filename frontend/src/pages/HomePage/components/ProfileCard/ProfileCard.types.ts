/**
 * Types for ProfileCard component
 */

export interface ProfileCardData {
  id: string;
  name: string;
  age: number;
  photo: string;
  goal: string;
  job?: string;
  company?: string;
  bio?: string;
  interests: string[];
  createdAt: string;
}

export interface ProfileCardProps {
  profile: ProfileCardData;
  onLike?: () => void;
  onDislike?: () => void;
}

