/**
 * Types for EventCard component
 */

export interface EventCardUser {
  id: string;
  photoUrl?: string;
  firstName: string;
}

export interface EventCardData {
  id: string;
  title: string;
  venue?: string;
  image: string;
  date?: string;
  endDate?: string; // Date until which event is available
  price?: string;
  averagePrice?: number; // Average cost
  description: string;
  category: string;
  categoryLabel?: string;
  linkUrl?: string; // External link to event
  savedBy?: EventCardUser[]; // Users who saved this event
  savedCount?: number; // Total number of users who saved
  createdAt: string;
}

export interface EventCardProps {
  event: EventCardData;
  onLike?: () => void;
  onDislike?: () => void;
  onLinkClick?: () => void;
}
