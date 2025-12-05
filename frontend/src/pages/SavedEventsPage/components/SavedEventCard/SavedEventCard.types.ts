/**
 * Types for SavedEventCard component
 */

import type { SavedEvent } from '../../SavedEventsPage.types';

export interface SavedEventCardProps {
  event: SavedEvent;
  onRemove: () => void;
  onOpenLink: () => void;
}

