/**
 * Types for FeedHeader component
 */

export type FeedTab = 'events' | 'profiles';

export interface FeedHeaderProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  onFilterClick: () => void;
  hasActiveFilters?: boolean;
}
