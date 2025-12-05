/**
 * Types for CategoryTabs component
 */

export interface CategoryTabsProps {
  categories: string[];
  selected: string;
  onChange: (category: string) => void;
}

