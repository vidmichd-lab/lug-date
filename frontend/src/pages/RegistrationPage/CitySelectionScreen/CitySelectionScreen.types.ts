/**
 * Types for CitySelectionScreen component
 */

export interface City {
  id: string;
  name: string;
  countryId: string;
  isActive: boolean;
}

export interface CitySelectionScreenProps {
  onNext: (cityId: string) => void;
  onBack: () => void;
  initialCityId?: string;
}

