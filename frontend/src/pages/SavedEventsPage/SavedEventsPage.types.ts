/**
 * Types for SavedEventsPage
 */

export interface SavedEvent {
  id: string;
  title: string;
  venue: string;
  image: string;
  category: string;
  date: string;
  price: string;
  type: string;
  link: string;
  savedAt: string;
}

export interface SavedEventsPageProps {
  initialCategory?: string;
}

export interface GetSavedEventsRequest {
  category?: string;
  limit?: number;
  offset?: number;
}

export interface GetSavedEventsResponse {
  events: SavedEvent[];
  total: number;
}

