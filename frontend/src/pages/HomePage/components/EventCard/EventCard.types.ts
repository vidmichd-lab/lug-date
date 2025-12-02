/**
 * Types for EventCard component
 */

export interface EventCardData {
  id: string;
  title: string;
  venue: string;
  image: string;
  date: string;
  price: string;
  description: string;
  category: string;
  createdAt: string;
}

export interface EventCardProps {
  event: EventCardData;
  onLike?: () => void;
  onDislike?: () => void;
}



