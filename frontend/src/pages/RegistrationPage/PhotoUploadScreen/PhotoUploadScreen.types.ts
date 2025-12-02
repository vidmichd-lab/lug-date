/**
 * Types for PhotoUploadScreen component
 */

export interface PhotoUploadScreenProps {
  onNext: (photoUrl: string) => void;
  onBack: () => void;
  initialPhotoUrl?: string;
}

export interface PhotoUrls {
  thumbnail: {
    webp: string;
    jpeg: string;
  };
  medium: {
    webp: string;
    jpeg: string;
  };
  full: {
    webp: string;
    jpeg: string;
  };
  blurDataUrl?: string;
}



