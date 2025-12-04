/**
 * HomePage component
 * Main feed screen with events and profiles
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
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
import { RegistrationModal } from '../../components/RegistrationModal';
import { useUserStore } from '../../stores';
import { useFeed, useLikeAction } from '../../hooks';
import styles from './HomePage.module.css';

// Mock categories for events (TODO: get from API)
const EVENT_CATEGORIES = ['Кафе', 'Выставки', 'Спектакли', 'Что-то еще', 'Другой'];

export function HomePage() {
  const [activeTab, setActiveTab] = useState<FeedTab>('events');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const { user } = useUserStore();

  // Use React Query hooks for data fetching
  const feedType = activeTab === 'events' ? 'events' : 'profiles';
  const {
    data: feedData,
    isLoading,
    refetch,
  } = useFeed(
    {
      type: feedType,
      categories: selectedCategories,
      limit: 20,
      offset: 0,
    },
    { requireAuth: false } // Allow guest mode
  );

  const likeAction = useLikeAction();

  // Extract cards from feed data and transform to Card format
  const cards = useMemo(() => {
    if (!feedData?.cards) return [];
    return feedData.cards.map((card: any) => {
      // API returns cards in format: { id, type, title, description, ... }
      // We need to transform to: { id, type, data: {...}, createdAt }
      const cardData = {
        id: card.id,
        title: card.title,
        description: card.description,
        imageUrl: card.imageUrl,
        category: card.category,
        location: card.location,
        date: card.date,
        linkUrl: card.linkUrl,
        ...card, // Include any other fields
      };

      return {
        id: card.id,
        type: card.type as 'event' | 'profile',
        data: cardData as any,
        createdAt: card.createdAt || card.date || new Date().toISOString(),
      } as Card;
    });
  }, [feedData]);

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

  // Reset card index when cards change
  useEffect(() => {
    setCurrentCardIndex(0);
  }, [cards.length, activeTab]);

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
      await likeAction.mutateAsync({
        cardId: currentCard.id,
        cardType: currentCard.type as 'event' | 'profile',
        action: 'dislike',
      });
      // Card will be removed from cache automatically via optimistic update
      setCurrentCardIndex((prev) => prev + 1);
    } catch (error: any) {
      console.error('Failed to record action:', error);
      // If unauthorized, show registration modal
      if (error?.message?.includes('UNAUTHORIZED') || error?.code === 'UNAUTHORIZED') {
        setShowRegistrationModal(true);
      } else {
        // Still advance card even if API call fails
        setCurrentCardIndex((prev) => prev + 1);
      }
    }
  }, [currentCard, isAuthenticated, likeAction]);

  const handleSwipeRight = useCallback(async () => {
    if (!currentCard) return;

    // Check authentication before action
    if (!isAuthenticated()) {
      setShowRegistrationModal(true);
      return;
    }

    try {
      await likeAction.mutateAsync({
        cardId: currentCard.id,
        cardType: currentCard.type as 'event' | 'profile',
        action: 'like',
      });
      // Card will be removed from cache automatically via optimistic update
      setCurrentCardIndex((prev) => prev + 1);
    } catch (error: any) {
      console.error('Failed to record action:', error);
      // If unauthorized, show registration modal
      if (error?.message?.includes('UNAUTHORIZED') || error?.code === 'UNAUTHORIZED') {
        setShowRegistrationModal(true);
      } else {
        // Still advance card even if API call fails
        setCurrentCardIndex((prev) => prev + 1);
      }
    }
  }, [currentCard, isAuthenticated, likeAction]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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
