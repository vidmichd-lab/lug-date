/**
 * SavedEventsPage component
 * Screen for displaying saved events (Хочу пойти)
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CategoryTabs, SavedEventCard, ConfirmationModal, SavedEmptyState } from './components';
import { BottomNav } from '../HomePage/components';
import { api } from '../../api/client';
import type { SavedEvent, GetSavedEventsResponse } from './SavedEventsPage.types';
import styles from './SavedEventsPage.module.css';

const DEFAULT_CATEGORIES = ['Все', 'Выставки', 'Кафе', 'Спектакли', 'Рестораны'];

export function SavedEventsPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [eventToRemove, setEventToRemove] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Map category display names to API category values
  const categoryMap: Record<string, string> = {
    Все: 'all',
    Выставки: 'exhibition',
    Кафе: 'cafe',
    Спектакли: 'theater',
    Рестораны: 'restaurant',
  };

  // Filter events by category
  const filteredEvents =
    selectedCategory === 'Все'
      ? savedEvents
      : savedEvents.filter((event) => {
          const apiCategory = categoryMap[selectedCategory] || selectedCategory.toLowerCase();
          return event.category.toLowerCase() === apiCategory || event.category === selectedCategory;
        });

  // Fetch saved events from API
  const fetchSavedEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const categoryFilter = selectedCategory === 'Все' ? undefined : selectedCategory.toLowerCase();
      const response = await api.get<GetSavedEventsResponse>(
        `/api/v1/saved-events${categoryFilter ? `?category=${categoryFilter}` : ''}`,
        {
          requireAuth: true,
        }
      );

      if (response.success && response.data) {
        setSavedEvents(response.data.events);
      } else {
        console.error('Failed to fetch saved events:', response.error);
        // For now, use empty array if API fails
        setSavedEvents([]);
      }
    } catch (error) {
      console.error('Error fetching saved events:', error);
      setSavedEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchSavedEvents();
  }, [fetchSavedEvents]);

  const handleRemoveClick = useCallback((eventId: string) => {
    setEventToRemove(eventId);
    setShowConfirmModal(true);
  }, []);

  const handleConfirmRemove = useCallback(async () => {
    if (eventToRemove) {
      try {
        const response = await api.delete(`/api/v1/saved-events/${eventToRemove}`, {
          requireAuth: true,
        });

        if (response.success) {
          setSavedEvents((prev) => prev.filter((e) => e.id !== eventToRemove));
        } else {
          console.error('Failed to remove event:', response.error);
        }
      } catch (error) {
        console.error('Error removing event:', error);
      } finally {
        setShowConfirmModal(false);
        setEventToRemove(null);
      }
    }
  }, [eventToRemove]);

  const handleCancelRemove = useCallback(() => {
    setShowConfirmModal(false);
    setEventToRemove(null);
  }, []);

  const handleOpenLink = useCallback((link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.savedHeader}>
        <h1 className={styles.savedTitle}>{t('saved.title')}</h1>
      </div>

      <CategoryTabs
        categories={DEFAULT_CATEGORIES}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />

      <div className={styles.savedEventsList}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <SavedEventCard
              key={event.id}
              event={event}
              onRemove={() => handleRemoveClick(event.id)}
              onOpenLink={() => handleOpenLink(event.link)}
            />
          ))
        ) : (
          <SavedEmptyState />
        )}
      </div>

      {showConfirmModal && (
        <ConfirmationModal
          title={t('saved.confirmRemove.title')}
          onConfirm={handleConfirmRemove}
          onCancel={handleCancelRemove}
        />
      )}

      <BottomNav activeTab="saved" />
    </div>
  );
}

