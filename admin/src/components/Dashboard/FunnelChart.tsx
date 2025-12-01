import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useFunnel } from '../../hooks/useAnalytics';
import styles from './Chart.module.css';

const COLORS = ['#FF6B6B', '#FF8E8E', '#FFB3B3', '#4ECDC4', '#6EDDD6'];

export const FunnelChart: React.FC = () => {
  const { data, isLoading, error } = useFunnel();

  if (isLoading) {
    return <div className={styles.loading}>Загрузка графика...</div>;
  }

  if (error || !data) {
    return <div className={styles.error}>Ошибка загрузки данных</div>;
  }

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>Воронка конверсии</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="stage" type="category" width={120} />
          <Tooltip
            formatter={(value: number, _name: string, props: any) => [
              `${value.toLocaleString()} (${props.payload.percentage}%)`,
              'Количество',
            ]}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]}>
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

