import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUsersChart } from '../../hooks/useAnalytics';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import styles from './Chart.module.css';

export const UsersChart: React.FC = () => {
  const { data, isLoading, error } = useUsersChart('7d');

  if (isLoading) {
    return <div className={styles.loading}>Загрузка графика...</div>;
  }

  if (error) {
    console.error('UsersChart error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки данных';
    return <div className={styles.error}>Ошибка загрузки данных: {errorMessage}</div>;
  }
  
  if (!data) {
    return <div className={styles.error}>Нет данных</div>;
  }

  const chartData = data.map((item) => ({
    date: format(new Date(item.date), 'dd MMM', { locale: ru }),
    registrations: item.registrations,
    active: item.active,
  }));

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>Регистрации пользователей</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="registrations"
            stroke="#FF6B6B"
            strokeWidth={2}
            name="Регистрации"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="active"
            stroke="#4ECDC4"
            strokeWidth={2}
            name="Активные"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

