/**
 * Types for FeedHeader component
 */

export type FeedTab = 'events' | 'profiles';

export interface FeedHeaderProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  showCategories: boolean;
}
