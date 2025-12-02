import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEventsTop } from '../../hooks/useAnalytics';
import styles from './Chart.module.css';

export const EventsTopChart: React.FC = () => {
  const { data, isLoading, error } = useEventsTop(10);

  if (isLoading) {
    return <div className={styles.loading}>Загрузка графика...</div>;
  }

  if (error) {
    console.error('EventsTopChart error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки данных';
    return <div className={styles.error}>Ошибка загрузки данных: {errorMessage}</div>;
  }
  
  if (!data) {
    return <div className={styles.error}>Нет данных</div>;
  }

  const chartData = data.map((event) => ({
    name: event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title,
    likes: event.likes,
    views: event.views,
    matches: event.matches,
  }));

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>Топ-10 событий по лайкам</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={150} />
          <Tooltip />
          <Legend />
          <Bar dataKey="likes" fill="#FF6B6B" name="Лайки" />
          <Bar dataKey="views" fill="#4ECDC4" name="Просмотры" />
          <Bar dataKey="matches" fill="#FF9500" name="Матчи" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

