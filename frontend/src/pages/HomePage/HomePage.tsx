/**
 * HomePage component
 * Main feed screen with events and profiles
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FeedHeader, SwipeableCard, ActionButtons, BottomNav, EmptyState } from './components';
import type { FeedTab } from './components';
import { sortCards } from './utils';
import type { Card } from './utils';
import { api } from '../../api/client';
import { RegistrationModal } from '../../components/RegistrationModal';
import { useUserStore } from '../../stores';
import styles from './HomePage.module.css';

// Mock categories for events (TODO: get from API)
const EVENT_CATEGORIES = ['all', 'art', 'music', 'theater', 'cinema', 'sport', 'food'];

export function HomePage() {
  const [activeTab, setActiveTab] = useState<FeedTab>('events');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

    // Filter by category for events
    if (activeTab === 'events' && selectedCategory !== 'all') {
      filtered = filtered.filter(
        (card) => card.type === 'event' && (card.data as any).category === selectedCategory
      );
    }

    return filtered;
  }, [cards, activeTab, selectedCategory]);

  // Sort cards
  const sortedCards = useMemo(() => {
    return sortCards(filteredCards, selectedCategory !== 'all');
  }, [filteredCards, selectedCategory]);

  const currentCard = sortedCards[currentCardIndex];
  const nextCard = sortedCards[currentCardIndex + 1];

  // Fetch cards from API
  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const type = activeTab === 'events' ? 'events' : 'profiles';
      
      // Build query string
      const params = new URLSearchParams();
      params.append('type', type);
      if (category) params.append('category', category);
      params.append('limit', '20');
      params.append('offset', '0');

      const response = await api.get<{ cards: Card[]; pagination: { total: number } }>(
        `/api/v1/feed?${params.toString()}`,
        {
          requireAuth: false, // Allow guest mode
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
  }, [activeTab, selectedCategory]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

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

  const handleTabChange = useCallback(
    (tab: FeedTab) => {
      setActiveTab(tab);
      setSelectedCategory('all');
      setCurrentCardIndex(0);
    },
    []
  );

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
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={EVENT_CATEGORIES}
        showCategories={activeTab === 'events'}
      />

      <div className={styles.cardStack}>
        {currentCard ? (
          <>
            <SwipeableCard
              card={currentCard}
              nextCard={nextCard || null}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
            <ActionButtons onDislike={handleSwipeLeft} onLike={handleSwipeRight} />
          </>
        ) : (
          <EmptyState type={activeTab} onRefresh={handleRefresh} />
        )}
      </div>

      <BottomNav activeTab="feed" />

      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
      />
    </div>
  );
}

