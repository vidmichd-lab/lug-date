/**
 * Types for SwipeableCard component
 */

import type { EventCardData } from '../EventCard';
import type { ProfileCardData } from '../ProfileCard';

export type CardData = EventCardData | ProfileCardData;
export type CardType = 'event' | 'profile';

export interface SwipeableCardProps {
  card: {
    id: string;
    type: CardType;
    data: CardData;
  };
  nextCard?: {
    id: string;
    type: CardType;
    data: CardData;
  } | null;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}



