/**
 * Types for CitySelectorModal component
 */

export interface City {
  id: string;
  name: string;
}

export interface CitySelectorModalProps {
  isOpen: boolean;
  selectedCityId?: string;
  cities: City[];
  onSelect: (cityId: string) => void;
  onClose: () => void;
}

