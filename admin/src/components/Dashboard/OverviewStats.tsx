import React from 'react';
import { useAnalyticsOverview } from '../../hooks/useAnalytics';
import styles from './OverviewStats.module.css';

export const OverviewStats: React.FC = () => {
  const { data, isLoading, error } = useAnalyticsOverview();

  if (isLoading) {
    return <div className={styles.loading}>Загрузка статистики...</div>;
  }

  if (error) {
    return <div className={styles.error}>Ошибка загрузки данных</div>;
  }

  if (!data) return null;

  return (
    <div className={styles.overviewStats}>
      <div className={styles.grid}>
        {/* Пользователи */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Пользователи</h3>
            <span className={styles.statBadge}>Всего</span>
          </div>
          <div className={styles.statValue}>{data.users.total.toLocaleString()}</div>
          <div className={styles.statFooter}>
            <span className={styles.statChange}>
              +{data.users.newThisWeek} за неделю
            </span>
            <span className={`${styles.statGrowth} ${data.users.growth >= 0 ? styles.positive : styles.negative}`}>
              {data.users.growth >= 0 ? '↑' : '↓'} {Math.abs(data.users.growth)}%
            </span>
          </div>
        </div>

        {/* События */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>События</h3>
            <span className={styles.statBadge}>Активных</span>
          </div>
          <div className={styles.statValue}>{data.events.active.toLocaleString()}</div>
          <div className={styles.statFooter}>
            <span className={styles.statChange}>
              {data.events.past} прошедших
            </span>
            <span className={styles.statTotal}>
              Всего: {data.events.total}
            </span>
          </div>
        </div>

        {/* Матчи */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Матчи</h3>
            <span className={styles.statBadge}>Всего</span>
          </div>
          <div className={styles.statValue}>{data.matches.total.toLocaleString()}</div>
          <div className={styles.statFooter}>
            <span className={styles.statChange}>
              {data.matches.today} сегодня, {data.matches.thisWeek} за неделю
            </span>
            <span className={`${styles.statGrowth} ${data.matches.growth >= 0 ? styles.positive : styles.negative}`}>
              {data.matches.growth >= 0 ? '↑' : '↓'} {Math.abs(data.matches.growth)}%
            </span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Конверсия</h3>
            <span className={styles.statBadge}>Лайки → Матчи</span>
          </div>
          <div className={styles.statValue}>{data.conversionRate.likesToMatches.toFixed(1)}%</div>
          <div className={styles.statFooter}>
            <span className={styles.statChange}>
              Просмотры → Лайки: {data.conversionRate.viewsToLikes.toFixed(1)}%
            </span>
            <span className={styles.statChange}>
              Просмотры → Матчи: {data.conversionRate.viewsToMatches.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Онлайн пользователи */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Онлайн</h3>
            <span className={styles.statBadge}>Сейчас</span>
          </div>
          <div className={styles.statValue}>{data.onlineUsers.toLocaleString()}</div>
          <div className={styles.statFooter}>
            <span className={styles.statChange}>Активных пользователей</span>
          </div>
        </div>
      </div>
    </div>
  );
};

