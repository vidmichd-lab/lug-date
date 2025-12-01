import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OverviewStats } from '../components/Dashboard/OverviewStats';
import { UsersChart } from '../components/Dashboard/UsersChart';
import { EventsTopChart } from '../components/Dashboard/EventsTopChart';
import { FunnelChart } from '../components/Dashboard/FunnelChart';
import { ActivityHeatmap } from '../components/Dashboard/ActivityHeatmap';
import { RecentMatches } from '../components/Dashboard/RecentMatches';
import { ExportButtons } from '../components/Dashboard/ExportButtons';
import styles from './Dashboard.module.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

export const Dashboard: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Дашборд аналитики</h1>
          <ExportButtons />
        </div>

        <OverviewStats />

        <div className={styles.chartsGrid}>
          <div className={styles.chartColumn}>
            <UsersChart />
            <FunnelChart />
            <ActivityHeatmap />
          </div>
          <div className={styles.chartColumn}>
            <EventsTopChart />
            <RecentMatches />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

