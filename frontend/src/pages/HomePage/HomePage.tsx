/**
 * HomePage component
 * Main feed screen with events and profiles
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FeedHeader,
  SwipeableCard,
  ActionButtons,
  BottomNav,
  EmptyState,
  FilterSheet,
} from './components';
import type { FeedTab } from './components';
import { sortCards } from './utils';
import type { Card } from './utils';
import { api } from '../../api/client';
import { RegistrationModal } from '../../components/RegistrationModal';
import { useUserStore } from '../../stores';
import styles from './HomePage.module.css';

// Mock categories for events (TODO: get from API)
const EVENT_CATEGORIES = ['Кафе', 'Выставки', 'Спектакли', 'Что-то еще', 'Другой'];

export function HomePage() {
  const [activeTab, setActiveTab] = useState<FeedTab>('events');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const { user } = useUserStore();

  // Filter cards by type and category
  const filteredCards = useMemo(() => {
    let filtered = cards.filter((card) => {
      if (activeTab === 'events') {
        return card.type === 'event';
      } else {
        return card.type === 'profile';
      }
    });

    // Filter by selected categories for events
    if (activeTab === 'events' && selectedCategories.length > 0) {
      filtered = filtered.filter(
        (card) => card.type === 'event' && selectedCategories.includes((card.data as any).category)
      );
    }

    return filtered;
  }, [cards, activeTab, selectedCategories]);

  // Sort cards
  const sortedCards = useMemo(() => {
    return sortCards(filteredCards, selectedCategories.length > 0);
  }, [filteredCards, selectedCategories]);

  const currentCard = sortedCards[currentCardIndex];
  const nextCard = sortedCards[currentCardIndex + 1];

  // Fetch cards from API
  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const type = activeTab === 'events' ? 'events' : 'profiles';

      // Build query string
      const params = new URLSearchParams();
      params.append('type', type);
      if (selectedCategories.length > 0) {
        selectedCategories.forEach((cat) => params.append('category', cat));
      }
      params.append('limit', '20');
      params.append('offset', '0');

      const response = await api.get<{ cards: Card[]; pagination: { total: number } }>(
        `/api/v1/feed?${params.toString()}`,
        {
          requireAuth: false, // Allow guest mode - can view cards without registration
        }
      );

      if (response.success && response.data) {
        setCards(response.data.cards || []);
        setCurrentCardIndex(0);
      } else {
        console.error('Failed to fetch cards:', response.error);
        setCards([]);
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error);
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedCategories]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Update cards when categories change
  useEffect(() => {
    if (!isLoading) {
      fetchCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    // Check if user exists in store
    if (user) return true;

    // Check if Telegram WebApp initData exists
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
      return true;
    }

    return false;
  }, [user]);

  const handleSwipeLeft = useCallback(async () => {
    if (!currentCard) return;

    // Check authentication before action
    if (!isAuthenticated()) {
      setShowRegistrationModal(true);
      return;
    }

    try {
      const response = await api.post(
        '/api/v1/feed/action',
        {
          cardId: currentCard.id,
          cardType: currentCard.type,
          action: 'dislike',
        },
        { requireAuth: true }
      );

      if (response.success) {
        setCurrentCardIndex((prev) => prev + 1);
      } else if (response.error?.code === 'UNAUTHORIZED') {
        setShowRegistrationModal(true);
      } else {
        setCurrentCardIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Failed to record action:', error);
      // Still advance card even if API call fails
      setCurrentCardIndex((prev) => prev + 1);
    }
  }, [currentCard, isAuthenticated]);

  const handleSwipeRight = useCallback(async () => {
    if (!currentCard) return;

    // Check authentication before action
    if (!isAuthenticated()) {
      setShowRegistrationModal(true);
      return;
    }

    try {
      const response = await api.post(
        '/api/v1/feed/action',
        {
          cardId: currentCard.id,
          cardType: currentCard.type,
          action: 'like',
        },
        { requireAuth: true }
      );

      if (response.success) {
        setCurrentCardIndex((prev) => prev + 1);
      } else if (response.error?.code === 'UNAUTHORIZED') {
        setShowRegistrationModal(true);
      } else {
        setCurrentCardIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Failed to record action:', error);
      // Still advance card even if API call fails
      setCurrentCardIndex((prev) => prev + 1);
    }
  }, [currentCard, isAuthenticated]);

  const handleRefresh = useCallback(() => {
    fetchCards();
  }, [fetchCards]);

  const handleTabChange = useCallback((tab: FeedTab) => {
    setActiveTab(tab);
    setSelectedCategories([]);
    setCurrentCardIndex(0);
  }, []);

  const handleFilterClick = useCallback(() => {
    setShowFilterSheet(true);
  }, []);

  const handleCategoryToggle = useCallback((category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      return [...prev, category];
    });
  }, []);

  const handleLinkClick = useCallback(() => {
    if (!currentCard) return;

    // Check authentication before opening link
    if (!isAuthenticated()) {
      setShowRegistrationModal(true);
      return;
    }

    // Open link (if available in card data)
    const eventData = currentCard.data as any;
    if (eventData.linkUrl) {
      window.open(eventData.linkUrl, '_blank', 'noopener,noreferrer');
    }
  }, [currentCard, isAuthenticated]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <FeedHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onFilterClick={handleFilterClick}
        hasActiveFilters={selectedCategories.length > 0}
      />

      <div className={styles.cardStack}>
        {currentCard ? (
          <>
            <SwipeableCard
              card={currentCard}
              nextCard={nextCard || null}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onLinkClick={handleLinkClick}
            />
            <ActionButtons onDislike={handleSwipeLeft} onLike={handleSwipeRight} />
          </>
        ) : (
          <EmptyState type={activeTab} onRefresh={handleRefresh} />
        )}
      </div>

      <BottomNav activeTab="feed" />

      <FilterSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        categories={EVENT_CATEGORIES}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
      />

      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
      />
    </div>
  );
}
