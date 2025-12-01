/**
 * Lazy-loaded pages with code splitting
 */

import { lazy } from 'react';

// Lazy load pages for code splitting
export const HomePage = lazy(() =>
  import('./HomePage').then((module) => ({ default: module.HomePage }))
);

export const ProfilePage = lazy(() =>
  import('./ProfilePage').then((module) => ({ default: module.ProfilePage }))
);

export const MatchesPage = lazy(() =>
  import('./MatchesPage').then((module) => ({ default: module.MatchesPage }))
);

