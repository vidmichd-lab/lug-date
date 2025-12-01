/**
 * SwipeableCard component
 * Card with swipe functionality (Tinder-like)
 */

import { FC, useState, useRef, useCallback, useEffect } from 'react';
import { EventCard } from '../EventCard';
import { ProfileCard } from '../ProfileCard';
import styles from './SwipeableCard.module.css';
import type { SwipeableCardProps } from './SwipeableCard.types';

const SWIPE_THRESHOLD = 100;

export const SwipeableCard: FC<SwipeableCardProps> = ({
  card,
  nextCard,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    startPosRef.current = { x: clientX, y: clientY };
  }, []);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return;

      const deltaX = clientX - startPosRef.current.x;
      const deltaY = clientY - startPosRef.current.y;

      setDragOffset({ x: deltaX, y: deltaY });
    },
    [isDragging]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const absX = Math.abs(dragOffset.x);
    if (absX > SWIPE_THRESHOLD) {
      if (dragOffset.x > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }

    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  }, [isDragging, dragOffset, onSwipeLeft, onSwipeRight]);

  // Mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },
    [handleStart]
  );

  // Global mouse/touch handlers for smooth dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleGlobalMouseUp = () => {
      handleEnd();
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleGlobalTouchEnd = () => {
      handleEnd();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    // Handled by global handler
  }, []);

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    },
    [handleStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    [handleMove]
  );

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Calculate next card transform
  const nextCardScale = isDragging
    ? Math.min(0.9 + (Math.abs(dragOffset.x) / 1000) * 0.1, 1.0)
    : 0.9;

  const nextCardOpacity = isDragging
    ? Math.min(0.8 + (Math.abs(dragOffset.x) / 1000) * 0.2, 1.0)
    : 0.8;

  // Calculate rotation based on drag
  const rotation = dragOffset.x / 20;

  return (
    <>
      {/* Next card preview */}
      {nextCard && (
        <div
          className={styles.nextCard}
          style={{
            transform: `scale(${nextCardScale})`,
            opacity: nextCardOpacity,
          }}
        >
          {nextCard.type === 'event' ? (
            <EventCard event={nextCard.data as any} />
          ) : (
            <ProfileCard profile={nextCard.data as any} />
          )}
        </div>
      )}

      {/* Current card */}
      <div
        className={styles.currentCard}
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {card.type === 'event' ? (
          <EventCard event={card.data as any} />
        ) : (
          <ProfileCard profile={card.data as any} />
        )}
      </div>
    </>
  );
};

