import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import {
  useAnalyticsOverview,
  useUsersChart,
  useEventsTop,
  useFunnel,
} from '../../hooks/useAnalytics';
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

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();

    // Общая статистика
    if (overview) {
      const overviewSheet = workbook.addWorksheet('Общая статистика');
      overviewSheet.addRow(['Метрика', 'Значение']);
      overviewSheet.addRow(['Пользователей всего', overview.users.total]);
      overviewSheet.addRow(['Новых за неделю', overview.users.newThisWeek]);
      overviewSheet.addRow(['Активных событий', overview.events.active]);
      overviewSheet.addRow(['Всего матчей', overview.matches.total]);
      overviewSheet.addRow(['Матчей сегодня', overview.matches.today]);
      overviewSheet.addRow(['Конверсия лайки→матчи', overview.conversionRate.likesToMatches]);
      overviewSheet.addRow(['Онлайн пользователей', overview.onlineUsers]);

      // Стилизация заголовка
      overviewSheet.getRow(1).font = { bold: true };
    }

    // График пользователей
    if (usersChart && usersChart.length > 0) {
      const chartSheet = workbook.addWorksheet('Регистрации');
      chartSheet.addRow(['Дата', 'Регистрации', 'Активные']);
      chartSheet.getRow(1).font = { bold: true };

      usersChart.forEach((item) => {
        chartSheet.addRow([
          new Date(item.date).toLocaleDateString('ru-RU'),
          item.registrations,
          item.active,
        ]);
      });
    }

    // Топ событий
    if (eventsTop && eventsTop.length > 0) {
      const eventsSheet = workbook.addWorksheet('Топ событий');
      eventsSheet.addRow(['Событие', 'Лайки', 'Просмотры', 'Матчи']);
      eventsSheet.getRow(1).font = { bold: true };

      eventsTop.forEach((event) => {
        eventsSheet.addRow([event.title, event.likes, event.views, event.matches]);
      });
    }

    // Воронка
    if (funnel && funnel.length > 0) {
      const funnelSheet = workbook.addWorksheet('Воронка');
      funnelSheet.addRow(['Этап', 'Количество', 'Процент']);
      funnelSheet.getRow(1).font = { bold: true };

      funnel.forEach((item) => {
        funnelSheet.addRow([item.stage, item.count, item.percentage]);
      });
    }

    // Сохранение файла
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
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
