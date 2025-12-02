import React from 'react';
import { useRecentMatches } from '../../hooks/useAnalytics';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import styles from './RecentMatches.module.css';

export const RecentMatches: React.FC = () => {
  const { data, isLoading, error } = useRecentMatches(10);

  if (isLoading) {
    return <div className={styles.loading}>Загрузка матчей...</div>;
  }

  if (error) {
    console.error('RecentMatches error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки данных';
    return <div className={styles.error}>Ошибка загрузки данных: {errorMessage}</div>;
  }
  
  if (!data) {
    return <div className={styles.error}>Нет данных</div>;
  }

  return (
    <div className={styles.recentMatches}>
      <h3 className={styles.title}>Последние матчи</h3>
      <div className={styles.list}>
        {data.map((match) => (
          <div key={match.id} className={styles.matchItem}>
            <div className={styles.matchUsers}>
              <div className={styles.user}>
                <div className={styles.avatar}>
                  {match.user1.avatar ? (
                    <img src={match.user1.avatar} alt={match.user1.name} />
                  ) : (
                    <span>{match.user1.name.charAt(0)}</span>
                  )}
                </div>
                <span className={styles.userName}>{match.user1.name}</span>
              </div>
              <span className={styles.matchIcon}>💕</span>
              <div className={styles.user}>
                <div className={styles.avatar}>
                  {match.user2.avatar ? (
                    <img src={match.user2.avatar} alt={match.user2.name} />
                  ) : (
                    <span>{match.user2.name.charAt(0)}</span>
                  )}
                </div>
                <span className={styles.userName}>{match.user2.name}</span>
              </div>
            </div>
            {match.eventTitle && (
              <div className={styles.eventInfo}>
                <span className={styles.eventIcon}>🎉</span>
                <span>{match.eventTitle}</span>
              </div>
            )}
            <div className={styles.matchTime}>
              {format(new Date(match.createdAt), 'dd MMM yyyy, HH:mm', { locale: ru })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

