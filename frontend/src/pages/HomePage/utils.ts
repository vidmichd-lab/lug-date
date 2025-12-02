/**
 * Utility functions for HomePage
 */

import type { EventCardData, ProfileCardData } from './components';

export type CardData = EventCardData | ProfileCardData;
export type CardType = 'event' | 'profile';

export interface Card {
  id: string;
  type: CardType;
  data: CardData;
  createdAt: string;
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Sort cards based on category
 */
export function sortCards(cards: Card[], hasCategory: boolean): Card[] {
  if (hasCategory) {
    // Random order for specific category
    return shuffleArray(cards);
  } else {
    // Sort by creation date (newer at the end)
    return [...cards].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }
}



