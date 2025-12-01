import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAnalyticsOverview, useUsersChart, useEventsTop, useFunnel } from '../../hooks/useAnalytics';
import styles from './ExportButtons.module.css';

export const ExportButtons: React.FC = () => {
  const { data: overview } = useAnalyticsOverview();
  const { data: usersChart } = useUsersChart('30d');
  const { data: eventsTop } = useEventsTop(20);
  const { data: funnel } = useFunnel();

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Заголовок
    doc.setFontSize(20);
    doc.text('Отчет по аналитике', 14, 22);
    doc.setFontSize(12);
    doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 14, 30);

    let yPos = 40;

    // Общая статистика
    if (overview) {
      doc.setFontSize(16);
      doc.text('Общая статистика', 14, yPos);
      yPos += 10;

      const statsData = [
        ['Метрика', 'Значение'],
        ['Пользователей всего', overview.users.total.toString()],
        ['Новых за неделю', overview.users.newThisWeek.toString()],
        ['Активных событий', overview.events.active.toString()],
        ['Всего матчей', overview.matches.total.toString()],
        ['Матчей сегодня', overview.matches.today.toString()],
        ['Конверсия лайки→матчи', `${overview.conversionRate.likesToMatches}%`],
        ['Онлайн пользователей', overview.onlineUsers.toString()],
      ];

      (doc as any).autoTable({
        startY: yPos,
        head: [statsData[0]],
        body: statsData.slice(1),
        theme: 'striped',
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // График пользователей
    if (usersChart && usersChart.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Регистрации пользователей', 14, 22);
      yPos = 30;

      const chartData = usersChart.map((item) => [
        new Date(item.date).toLocaleDateString('ru-RU'),
        item.registrations.toString(),
        item.active.toString(),
      ]);

      (doc as any).autoTable({
        startY: yPos,
        head: [['Дата', 'Регистрации', 'Активные']],
        body: chartData,
        theme: 'striped',
      });
    }

    // Топ событий
    if (eventsTop && eventsTop.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Топ событий', 14, 22);
      yPos = 30;

      const eventsData = eventsTop.map((event) => [
        event.title,
        event.likes.toString(),
        event.views.toString(),
        event.matches.toString(),
      ]);

      (doc as any).autoTable({
        startY: yPos,
        head: [['Событие', 'Лайки', 'Просмотры', 'Матчи']],
        body: eventsData,
        theme: 'striped',
      });
    }

    // Воронка
    if (funnel && funnel.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Воронка конверсии', 14, 22);
      yPos = 30;

      const funnelData = funnel.map((item) => [
        item.stage,
        item.count.toString(),
        `${item.percentage}%`,
      ]);

      (doc as any).autoTable({
        startY: yPos,
        head: [['Этап', 'Количество', 'Процент']],
        body: funnelData,
        theme: 'striped',
      });
    }

    doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Общая статистика
    if (overview) {
      const overviewData = [
        ['Метрика', 'Значение'],
        ['Пользователей всего', overview.users.total],
        ['Новых за неделю', overview.users.newThisWeek],
        ['Активных событий', overview.events.active],
        ['Всего матчей', overview.matches.total],
        ['Матчей сегодня', overview.matches.today],
        ['Конверсия лайки→матчи', overview.conversionRate.likesToMatches],
        ['Онлайн пользователей', overview.onlineUsers],
      ];
      const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Общая статистика');
    }

    // График пользователей
    if (usersChart && usersChart.length > 0) {
      const chartData = [
        ['Дата', 'Регистрации', 'Активные'],
        ...usersChart.map((item) => [
          new Date(item.date).toLocaleDateString('ru-RU'),
          item.registrations,
          item.active,
        ]),
      ];
      const chartSheet = XLSX.utils.aoa_to_sheet(chartData);
      XLSX.utils.book_append_sheet(workbook, chartSheet, 'Регистрации');
    }

    // Топ событий
    if (eventsTop && eventsTop.length > 0) {
      const eventsData = [
        ['Событие', 'Лайки', 'Просмотры', 'Матчи'],
        ...eventsTop.map((event) => [event.title, event.likes, event.views, event.matches]),
      ];
      const eventsSheet = XLSX.utils.aoa_to_sheet(eventsData);
      XLSX.utils.book_append_sheet(workbook, eventsSheet, 'Топ событий');
    }

    // Воронка
    if (funnel && funnel.length > 0) {
      const funnelData = [
        ['Этап', 'Количество', 'Процент'],
        ...funnel.map((item) => [item.stage, item.count, item.percentage]),
      ];
      const funnelSheet = XLSX.utils.aoa_to_sheet(funnelData);
      XLSX.utils.book_append_sheet(workbook, funnelSheet, 'Воронка');
    }

    XLSX.writeFile(workbook, `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className={styles.exportButtons}>
      <button onClick={exportToPDF} className={styles.button}>
        📄 Экспорт в PDF
      </button>
      <button onClick={exportToExcel} className={styles.button}>
        📊 Экспорт в Excel
      </button>
    </div>
  );
};

