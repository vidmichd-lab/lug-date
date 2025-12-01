import React from 'react';
import { useActivityHeatmap } from '../../hooks/useAnalytics';
import styles from './ActivityHeatmap.module.css';

export const ActivityHeatmap: React.FC = () => {
  const { data, isLoading, error } = useActivityHeatmap();

  if (isLoading) {
    return <div className={styles.loading}>Загрузка данных...</div>;
  }

  if (error || !data) {
    return <div className={styles.error}>Ошибка загрузки данных</div>;
  }

  // Группировка данных по дням и часам
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getValue = (day: string, hour: number) => {
    const item = data.find((d) => d.day === day && d.hour === hour);
    return item?.value || 0;
  };

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const getIntensity = (value: number) => {
    const percentage = (value / maxValue) * 100;
    if (percentage === 0) return 0;
    if (percentage < 25) return 1;
    if (percentage < 50) return 2;
    if (percentage < 75) return 3;
    return 4;
  };

  return (
    <div className={styles.heatmapContainer}>
      <h3 className={styles.title}>Активность по дням недели</h3>
      <div className={styles.heatmap}>
        <div className={styles.hoursColumn}>
          {hours.map((hour) => (
            <div key={hour} className={styles.hourLabel}>
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>
        <div className={styles.daysGrid}>
          {days.map((day) => (
            <div key={day} className={styles.dayColumn}>
              <div className={styles.dayLabel}>{day}</div>
              {hours.map((hour) => {
                const value = getValue(day, hour);
                const intensity = getIntensity(value);
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`${styles.cell} ${styles[`intensity-${intensity}`]}`}
                    title={`${day}, ${hour}:00 - ${value} действий`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.legend}>
        <span>Меньше</span>
        <div className={styles.legendColors}>
          <div className={`${styles.legendCell} ${styles['intensity-0']}`} />
          <div className={`${styles.legendCell} ${styles['intensity-1']}`} />
          <div className={`${styles.legendCell} ${styles['intensity-2']}`} />
          <div className={`${styles.legendCell} ${styles['intensity-3']}`} />
          <div className={`${styles.legendCell} ${styles['intensity-4']}`} />
        </div>
        <span>Больше</span>
      </div>
    </div>
  );
};

